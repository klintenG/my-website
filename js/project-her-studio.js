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
        this.field('visual_style').disabled=true;
        this.active = false; this.generation = 0; this.abort = new AbortController(); this.stageRows = new Map();
        this.form.addEventListener('submit', event => {event.preventDefault(); this.generate();});
        this.input.addEventListener('input', () => this.validate());
        root.querySelector('#her-mode').addEventListener('change', () => this.syncMode());
        for (const id of ['her-preset','her-renderer','her-format']) root.querySelector('#'+id).addEventListener('change', () => this.validate());
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
            for (const [field, values] of [['tone',config.options.tone],['visual_style',config.options.visual_style],['tts_provider',config.options.tts_provider]]) {
                const select = this.field(field), preferred = select.value; select.replaceChildren();
                for (const value of values) {const labels={informative:'Informative & storytelling',replicate:'Replicate · configured model',edge_tts:'Edge TTS',google_tts:'Google',elevenlabs:'ElevenLabs',chatterbox_turbo:'Replicate · Chatterbox Turbo'};const label=labels[value]||value.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());const option = new Option(label, value); select.append(option);}
                select.value = values.includes(preferred) ? preferred : values[0];
            }
            this.root.querySelector('#her-limits').textContent = `Public demo: ${config.limits.visitor_daily_jobs} submissions per network identity/day, ${config.limits.daily_jobs} total/day, ${config.limits.concurrent_jobs} render at a time. Every submitted job counts, including failures. Outputs expire after ${config.limits.output_hours} hours. Processing time varies.`;
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
        this.field('visual_preset').value = news ? 'reference_editorial' : 'default';
        for(const name of ['tts_provider','language','speed','news_music'])this.field(name).disabled=!news;
        if(!news){this.field('tts_provider').value=this.config?.classic_defaults?.tts_provider||'google_tts';this.field('language').value='english';this.field('speed').value='+0%';this.field('news_music').checked=false;}
        else this.field('tts_provider').value='replicate';
        this.root.querySelector('#her-news-options').hidden = !news;
        this.field('visual_style').disabled=news;
        this.root.querySelector('#her-style-note').textContent = news ? 'Reference editorial uses its own neutral historical/cutout art direction. The general art style applies to Classic mode.' : 'Classic uses the selected art style and backend-configured narration. Language, speed and optional music are News-only; Classic does not support cancellation.';
        if (news) {this.field('renderer').value = 'remotion';this.field('format').value = 'vertical';}
        this.validate();
    }
    validate() {
        const text = this.input.value.trim(), count = text ? text.split(/\s+/).length : 0;
        this.root.querySelector('#her-count').textContent = `${text.length} / 6000 characters · ${count} words`;
        let error = '';
        if (text.length > 6000) error = 'Keep the input within 6000 characters.';
        if (this.field('content_mode').value === 'news' && this.field('visual_preset').value === 'reference_editorial' && (this.field('renderer').value !== 'remotion' || this.field('format').value !== 'vertical')) error = 'Reference editorial requires Remotion and vertical 9:16. Choose Classic cutouts for other formats.';
        this.root.querySelector('#her-input-error').textContent = error;
        this.submit.disabled = this.active || !text || !!error || !this.config?.enabled;
        return !error && !!text;
    }
    payload() {
        const value = this.input.value.trim(), url = /^https?:\/\/\S+$/i.test(value) ? value : '';
        return {text: url ? '' : value, url, content_mode:this.field('content_mode').value,
            tone:this.field('tone').value, format:this.field('format').value,
            target_duration:Number(this.field('target_duration').value), visual_style:this.field('visual_style').value,
            renderer:this.field('renderer').value, visual_preset:this.field('visual_preset').value,
            editorial_text:this.field('editorial_text').value, editorial_assets:this.field('editorial_assets').value,
            news_source_policy:this.field('news_source_policy').value, tts_provider:this.field('tts_provider').value,
            news_music:this.field('news_music').checked, language:this.field('language').value, speed:this.field('speed').value};
    }
    async generate() {
        if (this.active || !this.config?.enabled || !this.validate()) return;
        this.active = true; this.validate(); this.hideOutput(); this.stageRows.clear(); this.stageList.replaceChildren();
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
            if (error.status) {this.active = false;this.store(null);}
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
        this.active = true;this.validate();await this.monitor();
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
        if (state.stage) {
            let row = this.stageRows.get(state.stage.name);
            if (!row) {row=document.createElement('li');this.stageRows.set(state.stage.name,row);this.stageList.append(row);}
            row.textContent = `${state.stage.label} — ${state.stage.status}`;
            row.dataset.state = state.stage.status;
        }
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
        if (result.captions_url) {const track=document.createElement('track');track.kind='captions';track.label='Narration';track.srclang=(result.language||this.field('language').value).slice(0,2);track.src=this.client.mediaUrl(result.captions_url);this.video.append(track);}
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
        this.hideOutput();this.stageRows.clear();this.stageList.replaceChildren();
        this.root.querySelector('#her-another').hidden=true;this.root.querySelector('#her-cancel').hidden=true;this.root.querySelector('#her-reconnect').hidden=true;this.root.querySelector('#her-job-id').textContent='';
        this.status.textContent='Ready to create';this.message.textContent='Adjust your input and generate a new video.';this.input.focus();this.validate();
    }
}
const root=document.getElementById('studio');
if(root){const client=new ProjectHerClient(window.SITE_CONFIG.projectHer.apiBase);const studio=new ProjectHerStudio(root,client);root.querySelector('#her-backend-retry').addEventListener('click',()=>studio.bootstrap());}
