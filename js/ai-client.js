/* ============================================================================
   AI CLIENT — shared transport for every AI Lab demo
   ============================================================================
   - Single endpoint from SITE_CONFIG.api.apiUrl
   - Sends raw Gemini `generateContent` bodies (the proxy only forwards an
     allow-list of fields and keeps the API key server-side)
   - Timeout, rate-limit, network and empty-output handling
   - Never surfaces raw technical errors to visitors: callers get an
     AIClientError with a friendly `userMessage`
   ============================================================================ */

class AIClientError extends Error {
    constructor(code, userMessage) {
        super(code);
        this.code = code;
        this.userMessage = userMessage;
    }
}

const AIClient = (() => {
    const FRIENDLY = {
        unavailable: 'This demo is temporarily unavailable. Please try again shortly, or reach out to me directly.',
        timeout: 'The request took too long. Please try again in a moment.',
        rateLimit: 'A lot of people are trying the demos right now. Please wait a minute and try again.',
        network: 'I could not reach the demo service. Please check your connection and try again.',
        empty: 'The model returned an empty response. Please try again.',
        invalid: 'The model returned something I could not read. Please try again.',
        input: 'Please provide some input first.',
    };

    function isConfigured() {
        return Boolean(SITE_CONFIG.api.apiUrl);
    }

    /** POST a Gemini request body; resolves to the parsed Gemini response. */
    async function generate(body) {
        if (!isConfigured()) throw new AIClientError('unconfigured', FRIENDLY.unavailable);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), SITE_CONFIG.api.timeoutMs);

        let response;
        try {
            response = await fetch(SITE_CONFIG.api.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
        } catch (err) {
            if (err.name === 'AbortError') throw new AIClientError('timeout', FRIENDLY.timeout);
            throw new AIClientError('network', FRIENDLY.network);
        } finally {
            clearTimeout(timer);
        }

        if (response.status === 429) throw new AIClientError('rate_limit', FRIENDLY.rateLimit);
        if (!response.ok) throw new AIClientError('http_' + response.status, FRIENDLY.unavailable);

        try {
            return await response.json();
        } catch (err) {
            throw new AIClientError('bad_json', FRIENDLY.invalid);
        }
    }

    /** Pull plain text and function calls out of a Gemini response. */
    function parse(data) {
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const text = parts.filter(p => typeof p.text === 'string').map(p => p.text).join('').trim();
        const toolCalls = parts
            .filter(p => p.functionCall)
            .map(p => ({ name: p.functionCall.name, args: p.functionCall.args || {} }));
        if (!text && toolCalls.length === 0) throw new AIClientError('empty', FRIENDLY.empty);
        return { text, toolCalls };
    }

    /** Parse a JSON object out of model output, repairing common LLM mistakes. */
    function parseJSON(text) {
        const cleaned = (text || '').replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const attempts = [cleaned];
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) attempts.push(match[0]);
        for (const candidate of attempts) {
            for (const variant of [candidate, candidate.replace(/,\s*([}\]])/g, '$1')]) {
                try { return JSON.parse(variant); } catch (e) { /* try next */ }
            }
        }
        throw new AIClientError('bad_json', FRIENDLY.invalid);
    }

    /** Escape model/user text before it is placed into innerHTML. */
    function esc(value) {
        return String(value ?? '').replace(/[&<>"']/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        ));
    }

    /** Friendly message for any thrown error. */
    function messageFor(err) {
        return err instanceof AIClientError ? err.userMessage : FRIENDLY.unavailable;
    }

    return { isConfigured, generate, parse, parseJSON, esc, messageFor, FRIENDLY };
})();
