/* ============================================================================
   GEMINI API PROXY — Serverless Edge Function
   ============================================================================
   
   Deploy this as a Cloudflare Worker, Vercel Edge Function, or Netlify Function.
   This keeps your API key server-side and adds basic rate limiting.

   SETUP:
   1. Set the GEMINI_API_KEY environment variable in your deployment platform
   2. Update the ALLOWED_ORIGINS to your actual domain(s)
   3. Deploy and update the API_URL in ai-chat.js and resume-agent.js

   CLOUDFLARE WORKER DEPLOYMENT:
   - Install wrangler: npm install -g wrangler
   - wrangler init gemini-proxy
   - Copy this file's handleRequest logic into src/index.js
   - wrangler secret put GEMINI_API_KEY
   - wrangler deploy

   VERCEL EDGE FUNCTION:
   - Place this in /api/proxy.js in a Vercel project
   - Set GEMINI_API_KEY in Vercel Environment Variables
   - Deploy

   ============================================================================ */

// ===== CONFIGURATION =====
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Add your production domain(s) here
const ALLOWED_ORIGINS = [
    'https://klinteng.com',
    'https://www.klinteng.com',
    'http://localhost:3000',
    'http://127.0.0.1:5500',   // VS Code Live Server
    'http://localhost:5500',
];

// Simple in-memory rate limiter (per-IP, resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15;      // 15 requests per minute per IP

// ===== RATE LIMITER =====
function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return false;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        return true;
    }
    return false;
}

// ===== CORS HEADERS =====
function getCorsHeaders(origin) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

// ===== MAIN HANDLER =====
// Adapt this for your deployment platform:
//
// Cloudflare Worker:
//   export default { async fetch(request, env) { return handleRequest(request, env.GEMINI_API_KEY); } }
//
// Vercel Edge Function:
//   export default async function handler(req) { return handleRequest(req, process.env.GEMINI_API_KEY); }
//
// Node.js Express:
//   app.post('/api/proxy', async (req, res) => { ... });

async function handleRequest(request, apiKey) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP')
        || request.headers.get('X-Forwarded-For')
        || 'unknown';

    if (isRateLimited(clientIP)) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Validate API key exists
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();

        // Basic input validation
        if (!body.contents || !Array.isArray(body.contents)) {
            return new Response(JSON.stringify({ error: 'Invalid request body' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Forward to Gemini API (key stays server-side)
        const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const geminiData = await geminiResponse.json();

        return new Response(JSON.stringify(geminiData), {
            status: geminiResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Proxy error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}

// ===== EXPORT FOR CLOUDFLARE WORKERS =====
export default {
    async fetch(request, env) {
        return handleRequest(request, env.GEMINI_API_KEY);
    }
};
