/* ============================================================================
   GEMINI API PROXY SERVER
   ============================================================================
   
   Simple Express server that proxies requests to the Gemini API.
   Keeps your API key on the server — never exposed to the browser.

   SETUP:
   1. cd server
   2. npm install
   3. cp .env.example .env
   4. Paste your Gemini API key in .env
   5. npm start

   The server runs on http://localhost:3001 by default.
   Your website JS files point to http://localhost:3001/api/chat

   ============================================================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== CONFIGURATION =====
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Allowed origins — add your production domain when you deploy
const ALLOWED_ORIGINS = [
    'https://klinteng.com',
    'https://www.klinteng.com',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',   // VS Code Live Server
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'null',                     // file:// protocol sends "null" as origin
];

// ===== MIDDLEWARE =====
app.use(express.json({ limit: '1mb' }));
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (curl, Postman, file://)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

// ===== RATE LIMITING (simple in-memory) =====
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 15;               // 15 requests per minute per IP

function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return next();
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Rate limit exceeded. Try again in a minute.' });
    }
    next();
}

// ===== PROXY ROUTE =====
app.post('/api/chat', rateLimiter, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'paste-your-gemini-api-key-here') {
        console.error('❌ GEMINI_API_KEY not set. Edit server/.env');
        return res.status(500).json({ error: 'Server configuration error — API key not set' });
    }

    // Basic input validation
    if (!req.body.contents || !Array.isArray(req.body.contents)) {
        return res.status(400).json({ error: 'Invalid request body — missing contents array' });
    }

    try {
        const geminiResponse = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('Gemini API error:', geminiResponse.status, data);
            return res.status(geminiResponse.status).json(data);
        }

        res.json(data);

    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to reach Gemini API' });
    }
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        model: GEMINI_MODEL,
        hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'paste-your-gemini-api-key-here',
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    const hasKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'paste-your-gemini-api-key-here';
    console.log('');
    console.log('🚀 Gemini Proxy Server running at http://localhost:' + PORT);
    console.log('   Proxy endpoint:  http://localhost:' + PORT + '/api/chat');
    console.log('   Health check:    http://localhost:' + PORT + '/health');
    console.log('   API key status:  ' + (hasKey ? '✅ Set' : '❌ NOT SET — edit server/.env'));
    console.log('');
    if (!hasKey) {
        console.log('⚠️  To fix: open server/.env and paste your Gemini API key');
        console.log('   Get a key at: https://aistudio.google.com/apikey');
        console.log('');
    }
});
