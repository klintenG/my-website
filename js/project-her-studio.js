import {ProjectHerClient, HerApiError} from './project-her-client.js';
const terminal = new Set(['completed', 'failed', 'cancelled']);
const storageKey = 'project-her-job-v1';
const pause = (ms, signal) => new Promise(resolve => { const finish=()=>{clearTimeout(timer);signal?.removeEventListener('abort',finish);resolve();};const timer=setTimeout(finish,ms);if(signal?.aborted)finish();else signal?.addEventListener('abort',finish,{once:true}); });

export class ProjectHerStudio {
    constructor(root, client) {
        this.root = root; this.client = client; this.form = root.querySelector('form');
        this.input = root.querySelector('#her-input'); this.submit = root.querySelector('#her-generate');
        this.status = root.querySelector('#her-status'); this.message = root.querySelector('#her-message');
        this.stageList = root.querySelector('#her-stages'); this.video = root.querySelector('#her-video');
        this.workspace = root.querySelector('#her-output'); this.config = null; this.job = null; this.lastState = null;
        this.active = false; this.generation = 0; this.abort = new AbortController(); this.stageRows = new Map();
        this.form.addEventListener('submit', event => {event.preventDefault(); this.generate();});
        this.input.addEventListener('input', () => this.validate());
        root.querySelector('#her-mode').addEventListener('change', () => this.syncMode());
        root.querySelector('#her-cancel').addEventListener('click', () => this.cancel());
        root.querySelector('#her-reconnect').addEventListener('click', () => this.reconnect());
        root.querySelector('#her-another').addEventListener('click', () => this.reset());
        root.querySelectorAll('[data-her-example]').forEach(button => button.addEventListener('click', () => {
            this.input.value = button.dataset.herExample; this.input.dispatchEvent(new Event('input')); this.input.focus();
        }));
        window.addEventListener('pagehide', () => this.abort.abort());
        window.addEventListener('pageshow', event => {if (event.persisted && this.job) this.reconnect();});
        this.bootstrap();
    }
    field(name) { return this.form.elements.namedItem(name); }
    readStorage() { try { return JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { return null; } }
    store(value) { try { value ? sessionStorage.setItem(storageKey, JSON.stringify(value)) : sessionStorage.removeItem(storageKey); } catch {} }
    async bootstrap() {
        this.status.textContent = 'Checking video backend…';
        try {
            const config = await this.client.capabilities(this.abort.signal);
            if (config.version !== 1 || !config.options || !config.limits) throw new HerApiError('The video API version is not supported.');
            this.config = config;
            this.root.querySelector('#her-limits').textContent = config.limits.daily_limits_disabled
                ? `Daily generation limits are temporarily disabled for testing. ${config.limits.concurrent_jobs} render at a time. Outputs expire after ${config.limits.output_hours} hours. Processing time varies.`
                : `Public demo: ${config.limits.visitor_daily_jobs} submissions per network identity/day, ${config.limits.daily_jobs} total/day, ${config.limits.concurrent_jobs} render at a time. Every submitted job counts, including failures. Outputs expire after ${config.limits.output_hours} hours. Processing time varies.`;
            this.status.textContent = config.enabled ? 'Ready to create' : 'Generation is temporarily paused';
            this.message.textContent = config.enabled ? 'Enter an idea or public article URL. No video has been generated in this session.' : 'Previously generated examples remain available below.';
            this.root.querySelector('#her-backend-retry').hidden = true;
        } catch (error) {
            if (this.abort.signal.aborted) return;
            this.status.textContent = 'Video backend unavailable';
            this.message.textContent = error.message + ' You can watch the genuine example below.';
            this.root.querySelector('#her-backend-retry').hidden = false;
        }
        this.validate();
        const saved = this.readStorage();
        if (saved?.expiresAt > Date.now()/1000 && /^[a-f0-9]{32}$/.test(saved.jobId) && saved.token) {
            this.job = saved; this.active = true; this.reconnect();
        } else if (saved?.pendingKey && saved.createdAt > Date.now()-3600000) {
            try { const recovered = await this.client.recover(saved.pendingKey, this.abort.signal); this.accept(recovered, saved.pendingKey); this.reconnect(); }
            catch { this.message.textContent = 'A previous submission was not confirmed. It may already be running; do not resubmit immediately. Check the backend again before creating another job.'; }
        } else this.store(null);
    }
    syncMode() {
        const news = this.field('content_mode').value === 'news';
        this.root.querySelector('#her-style-note').textContent = news
            ? 'Project HER chooses the narration, visual style, timing and vertical format.'
            : 'Classic uses the backend-configured narrator and its standard video settings.';
        this.validate();
    }
    validate() {
        const text = this.input.value.trim(), count = text ? text.split(/\s+/).length : 0;
        this.root.querySelector('#her-count').textContent = `${text.length} / 6000 characters · ${count} words`;
        let error = '';
        if (text.length > 6000) error = 'Keep the input within 6000 characters.';
        this.root.querySelector('#her-input-error').textContent = error;
        this.submit.disabled = this.active || !text || !!error || !this.config?.enabled;
        return !error && !!text;
    }
    payload() {
        const value = this.input.value.trim(), url = /^https?:\/\/\S+$/i.test(value) ? value : '';
        const mode = this.field('content_mode').value;
        const payload = {text: url ? '' : value, url, content_mode: mode};
        // The API owns all News defaults. Classic has two mode-specific contract fields.
        if (mode === 'article') {
            payload.visual_preset = 'default';
            payload.tts_provider = this.config.classic_defaults.tts_provider;
        }
        return payload;
    }
    async generate() {
        if (this.active || !this.config?.enabled || !this.validate()) return;
        this.active = true; this.validate(); this.hideOutput(); this.stageRows.clear(); this.stageList.replaceChildren();
        this.root.querySelector('#her-working').hidden = false;this.root.querySelector('#her-empty').hidden=true;
        const key = crypto.randomUUID(); this.store({pendingKey:key,createdAt:Date.now()});
        this.status.textContent = 'Submitting your job…'; this.message.textContent = 'Waiting for the backend to confirm job creation.';
        this.form.setAttribute('aria-busy','true');
        const payload = this.payload();
        try {
            let accepted;
            try {accepted = await this.client.create(payload, key, this.abort.signal);}
            catch (error) {
                // A lost response is ambiguous. Reusing the same key cannot
                // create a second paid job; never retry validation/quota errors.
                if (error.status || this.abort.signal.aborted) throw error;
                await pause(2000, this.abort.signal);
                accepted = await this.client.create(payload, key, this.abort.signal);
            }
            this.accept(accepted, key); await this.monitor();
        } catch (error) {
            if (this.abort.signal.aborted) return;
            this.status.textContent = error.status === 429 ? 'Generation limit reached' : 'Job submission could not be confirmed';
            this.message.textContent = error.message;
            if (error.status) {this.active = false;this.store(null);this.root.querySelector('#her-working').hidden=true;this.root.querySelector('#her-empty').hidden=false;}
            else {this.root.querySelector('#her-reconnect').hidden = false;}
            this.validate();
        } finally {this.form.removeAttribute('aria-busy');}
    }
    accept(value, key) {
        if (!/^[a-f0-9]{32}$/.test(value.job_id) || !/^[a-f0-9]{64}$/.test(value.access_token)) throw new HerApiError('Invalid job confirmation. Reconnect before resubmitting.');
        this.job = {jobId:value.job_id,token:value.access_token,expiresAt:value.expires_at,requestKey:key};
        this.store(this.job);this.active = true;
        this.root.querySelector('#her-job-id').textContent = 'Job '+value.job_id.slice(0,8);
        this.root.querySelector('#her-cancel').hidden = !value.cancel_supported;
    }
    async reconnect() {
        this.abort.abort();this.abort = new AbortController();this.generation++;
        this.root.querySelector('#her-reconnect').hidden = true;
        if (!this.job) {
            const pending = this.readStorage();
            if (pending?.pendingKey) {
                try {this.accept(await this.client.recover(pending.pendingKey,this.abort.signal),pending.pendingKey);}
                catch (error) {this.status.textContent = 'Submission status unavailable';this.message.textContent = error.message;this.root.querySelector('#her-reconnect').hidden = false;return;}
            } else {await this.bootstrap();return;}
        }
        this.active = true;this.validate();this.root.querySelector('#her-working').hidden=false;this.root.querySelector('#her-empty').hidden=true;await this.monitor();
    }
    async monitor() {
        const signal = this.abort.signal, generation = this.generation;
        let disconnects = 0, failures = 0;
        const update = state => {if (!signal.aborted && generation === this.generation) this.render(state);};
        while (!signal.aborted && this.active && generation === this.generation) {
            try {
                const state = await this.client.status(this.job,signal); failures = 0;update(state);
                if (terminal.has(state.status)) return;
                if (disconnects < 3) {
                    const streamAbort = new AbortController();
                    const forwardAbort = () => streamAbort.abort(); signal.addEventListener('abort',forwardAbort,{once:true});
                    // No event within 70s means connection loss, never progress.
                    let watchdog = setTimeout(forwardAbort,70000);
                    try {await this.client.events(this.job, state => {clearTimeout(watchdog);watchdog=setTimeout(forwardAbort,70000);update(state);if(terminal.has(state.status))streamAbort.abort();},streamAbort.signal);}
                    catch {disconnects++;}
                    finally {clearTimeout(watchdog);signal.removeEventListener('abort',forwardAbort);}
                } else this.root.querySelector('#her-connection').textContent = 'Live stream unavailable · checking real status periodically';
            } catch (error) {
                if (signal.aborted) return;
                if ([404,410].includes(error.status)) {this.active=false;this.store(null);this.status.textContent='Job unavailable or expired';this.message.textContent=error.message;this.validate();return;}
                failures++;
                this.root.querySelector('#her-connection').textContent = 'Connection interrupted. Rendering may continue on the backend.';
                if (failures >= 5) {this.status.textContent='Connection unavailable';this.message.textContent='Your job may still be running. Reconnect to check it before submitting again.';this.root.querySelector('#her-reconnect').hidden=false;return;}
            }
            if (this.active) await pause(Math.min(20000,3000*Math.max(1,failures)),signal);
        }
    }
    render(state) {
        if (state.job_id !== this.job?.jobId || !['queued','running',...terminal].includes(state.status)) throw new HerApiError('Unexpected job status. Reconnect to check it.');
        this.lastState = state;
        this.status.textContent = state.cancel_requested && !terminal.has(state.status) ? 'Cancellation requested…' : {queued:'Job queued',running:'Creating your video',completed:'Your video is ready',failed:'Generation failed',cancelled:'Generation cancelled'}[state.status];
        this.message.textContent = state.error || (state.stage ? state.stage.label : state.status === 'completed' ? 'This is the actual output of your submitted job.' : 'Waiting for the next backend stage.');
        const stages = Array.isArray(state.stages) ? state.stages : state.stage ? [state.stage] : [];
        this.stageList.replaceChildren();
        for (const stage of stages) {
            const row = document.createElement('li');
            row.dataset.state = stage.status;
            row.textContent = `${stage.label} — ${stage.status === 'completed' ? 'done' : stage.status}${stage.status === 'running' && stage.elapsed ? ` · ${Math.round(stage.elapsed)}s` : ''}`;
            this.stageList.append(row);
        }
        const working = this.root.querySelector('#her-working');
        working.hidden = terminal.has(state.status);
        this.root.querySelector('#her-working-detail').textContent = state.stage?.label || (state.status === 'queued' ? 'Waiting for the renderer…' : `${stages.filter(item => item.status === 'completed').length} stages completed`);
        const cancel=this.root.querySelector('#her-cancel');cancel.hidden=!state.cancel_supported||terminal.has(state.status);cancel.disabled=state.cancel_requested;
        if (terminal.has(state.status)) {
            this.active=false;this.form.removeAttribute('aria-busy');this.root.querySelector('#her-connection').textContent='';
            this.root.querySelector('#her-another').hidden=false;
            this.validate();
        }
        if (state.status === 'completed' && state.result) {
            try {this.showOutput(state.result);}
            catch (error) {this.hideOutput();this.status.textContent='Video result unavailable';this.message.textContent=error.message;this.root.querySelector('#her-reconnect').hidden=false;}
        }
    }
    showOutput(result) {
        const videoUrl = this.client.mediaUrl(result.video_url), downloadUrl = this.client.mediaUrl(result.download_url);
        this.video.crossOrigin='anonymous';this.video.src=videoUrl;
        this.video.poster=result.poster_url ? this.client.mediaUrl(result.poster_url) : '';
        this.video.querySelectorAll('track').forEach(track=>track.remove());
        if (result.captions_url) {const track=document.createElement('track');track.kind='captions';track.label='Narration';track.srclang=(result.language||'english').slice(0,2);track.src=this.client.mediaUrl(result.captions_url);this.video.append(track);}
        this.root.querySelector('#her-result-title').textContent=result.title||'Generated video';
        this.root.querySelector('#her-result-meta').textContent=[result.duration ? `${Number(result.duration).toFixed(1)} seconds` : '',result.resolution||''].filter(Boolean).join(' · ');
        const download=this.root.querySelector('#her-download');download.href=downloadUrl;
        download.hidden=true;
        this.video.onloadedmetadata=()=>{if(Number.isFinite(this.video.duration)&&this.video.duration>0)download.hidden=false;};
        this.video.onerror=()=>{download.hidden=true;this.status.textContent='Video could not be loaded';this.message.textContent='The output link may have expired. Reconnect to renew it or create another video.';this.root.querySelector('#her-reconnect').hidden=false;};
        this.workspace.hidden=false;this.root.querySelector('#her-empty').hidden=true;
        this.video.load();
    }
    hideOutput() {this.video.onerror=null;this.video.onloadedmetadata=null;this.video.pause();this.video.removeAttribute('src');this.video.load();this.workspace.hidden=true;this.root.querySelector('#her-download').hidden=true;this.root.querySelector('#her-empty').hidden=false;}
    async cancel() {
        if (!this.job || !this.lastState?.cancel_supported) return;
        this.root.querySelector('#her-cancel').disabled=true;
        try {await this.client.cancel(this.job,this.abort.signal);this.status.textContent='Cancellation requested…';this.message.textContent='Waiting for the rendering pipeline to confirm cancellation.';}
        catch(error){this.message.textContent=error.message;this.root.querySelector('#her-cancel').disabled=false;}
    }
    reset() {
        if (this.active) return;
        this.abort.abort();this.abort=new AbortController();this.generation++;this.job=null;this.lastState=null;this.store(null);
        this.hideOutput();this.stageRows.clear();this.stageList.replaceChildren();this.root.querySelector('#her-working').hidden=true;
        this.root.querySelector('#her-another').hidden=true;this.root.querySelector('#her-cancel').hidden=true;this.root.querySelector('#her-reconnect').hidden=true;this.root.querySelector('#her-job-id').textContent='';
        this.status.textContent='Ready to create';this.message.textContent='Adjust your input and generate a new video.';this.input.focus();this.validate();
    }
}
const root=document.getElementById('studio');
if(root){const client=new ProjectHerClient(window.SITE_CONFIG.projectHer.apiBase);const studio=new ProjectHerStudio(root,client);root.querySelector('#her-backend-retry').addEventListener('click',()=>studio.bootstrap());}
