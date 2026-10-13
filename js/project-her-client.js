/** Native portfolio adapter. Contracts: docs/project-her-native-api.md.
 * @typedef {'queued'|'running'|'completed'|'failed'|'cancelled'} JobStatus
 * @typedef {{name:string,label:string,status:string,elapsed:number}} Stage
 * @typedef {{title:string,duration:number,resolution:string,video_url:string,download_url:string,poster_url?:string,captions_url?:string}} Result
 * @typedef {{job_id:string,status:JobStatus,stage:Stage|null,result:Result|null,error:string|null,expires_at:number,cancel_supported:boolean,cancel_requested:boolean}} Job
 * @typedef {{jobId:string,token:string,expiresAt:number,requestKey?:string}} JobAccess
 * @typedef {{method?:string,body?:Record<string,unknown>,token?:string,key?:string,signal?:AbortSignal,timeout?:number}} RequestOptions
 */
export class HerApiError extends Error {
    constructor(message, status = 0) { super(message); this.name = 'HerApiError'; this.status = status; }
}

export class ProjectHerClient {
    constructor(baseUrl, fetcher = window.fetch.bind(window)) {
        this.base = new URL(baseUrl, location.origin);
        if (!['https:', 'http:'].includes(this.base.protocol) || (this.base.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(this.base.hostname))) throw new Error('Invalid video API address');
        this.base.pathname = this.base.pathname.replace(/\/$/, '');
        this.fetcher = fetcher;
    }
    /** @param {string} path @param {RequestOptions} options */
    async request(path, {method = 'GET', body, token, key, signal, timeout = 90000} = {}) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        if (signal?.aborted) controller.abort();
        signal?.addEventListener('abort', abort, {once: true});
        const timer = setTimeout(abort, timeout);
        try {
            const headers = {Accept: 'application/json'};
            if (body) headers['Content-Type'] = 'application/json';
            if (token) headers.Authorization = 'Bearer ' + token;
            if (key) headers['Idempotency-Key'] = key;
            const response = await this.fetcher(this.base.href + path, {method, headers, body: body ? JSON.stringify(body) : undefined, signal: controller.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'});
            let data;
            try { data = await response.json(); } catch { throw new HerApiError('The video API is unavailable or has not been deployed yet.', response.status); }
            if (!response.ok) throw new HerApiError(data.error || 'The video request failed.', response.status);
            return data;
        } catch (error) {
            if (error instanceof HerApiError || signal?.aborted) throw error;
            throw new HerApiError('The video backend could not be reached. Your job may still be running; reconnect to check its status.');
        } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
    }
    capabilities(signal) { return this.request('/config', {signal}); }
    /** Idempotency-Key is reused only for retries of this same user submission. */
    create(payload, key, signal) { return this.request('/jobs', {method: 'POST', body: payload, key, signal}); }
    recover(key, signal) { return this.request('/submission', {key, signal}); }
    /** @param {JobAccess} access @returns {Promise<Job>} */
    status(access, signal) { return this.request('/jobs/' + access.jobId, {token: access.token, signal, timeout: 30000}); }
    cancel(access, signal) { return this.request('/jobs/' + access.jobId + '/cancel', {method: 'POST', token: access.token, signal, timeout: 30000}); }
    /** Fetch streaming supports scoped Authorization without credentials in URLs. */
    async events(access, onEvent, signal) {
        const response = await this.fetcher(this.base.href + '/jobs/' + access.jobId + '/events', {headers: {Accept: 'text/event-stream', Authorization: 'Bearer ' + access.token}, signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'});
        if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new HerApiError('Live updates disconnected; checking actual job status.', response.status);
        const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '';
        try {
            while (!signal.aborted) {
                const {value, done} = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {stream: true}).replace(/\r\n/g, '\n');
                let boundary;
                while ((boundary = buffer.indexOf('\n\n')) !== -1) {
                    const block = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
                    const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
                    if (data) onEvent(JSON.parse(data));
                }
                if (buffer.length > 100000) throw new HerApiError('Invalid progress stream. Reconnect to check the job.');
            }
        } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    }
    mediaUrl(value) {
        const url = new URL(value, this.base.origin);
        if (url.origin !== this.base.origin || !url.pathname.startsWith(this.base.pathname + '/jobs/') || !/\/media\/(video|poster|captions)$/.test(url.pathname) || !url.searchParams.get('ticket')) throw new HerApiError('The backend returned an invalid video link.');
        return url.href;
    }
}
