# Klinteng.com — AI Agent Engineer Portfolio

A recruiter-focused portfolio and interactive AI engineering laboratory for **Bill Klinten Guduru** — AI Agent Engineer & AI Integration Engineer with 6+ years of enterprise software engineering experience across Infosys and EdgeVerve.

**Live Site:** [https://klinteng.com](https://klinteng.com)  
**Flagship Demo (Project HER):** [https://project-her-793574023262.us-central1.run.app](https://project-her-793574023262.us-central1.run.app)

---

## What This Demonstrates

- **AI Function & Tool Calling** — Client-side Gemini tool calling with real-time UI dispatches (maps, tech stacks, page navigation, and rich project detail cards).
- **Strict JSON Schema Enforcement** — Structured LLM outputs validated with deterministic schemas and automatic repair pipelines.
- **Context Engineering** — Compact flow-state context summaries and bounded profile memory grounding every model response.
- **Multi-Agent Orchestration & Media Generation** — Flagship autonomous article-to-video agent (**Project HER**) containerized and running on GCP Cloud Run.
- **Enterprise Software Foundation** — 6+ years delivering high-availability banking platforms (Finacle), Spring Boot microservices, and modern TypeScript/React applications.

---

## Architectural Highlights

```text
User / Recruiter
      │
      ▼
Interactive AI Lab (klinteng.com)
  ├── Portfolio Assistant  ──► Function Calling (Tools: Logos, Location, Nav)
  ├── Resume Fit Analyzer  ──► Strict JSON Schema Output (Fit scoring & Gaps)
  └── Code Review Agent    ──► Multi-Dimension Evaluation & Boundary Constraint
      │
      ▼
Serverless Edge Proxy (api/proxy.js)
  └── Enforces CORS, IP Rate Limiting, and guards GEMINI_API_KEY
      │
      ▼
Google Gemini API (gemini-2.5-flash)
```

### Flagship: Project HER (GCP Cloud Run)

```text
Article / URL / Story
        ↓
Content Analysis & Scene Partitioning
        ↓
LLM Script Generation (Gemini)
        ↓
Neural Narration (Google TTS)
        ↓
Visual Retrieval (Pexels API)
        ↓
Dynamic Karaoke Captions
        ↓
Video Composition (MoviePy)
        ↓
Final MP4 Explainer Video
```

---

## Project Structure

```
my-website/
├── index.html          # Recruiter-focused portfolio layout
├── css/
│   └── style.css       # Design system, dark/light themes, animations & responsive styling
├── js/
│   ├── config.js       # Centralized stats, links, and demo status configuration
│   ├── ai-client.js    # Shared AI transport with friendly errors, JSON repair, and escaping
│   ├── profile-data.js # Structured career profile context injected into LLM tools
│   ├── ai-chat.js      # Gemini function-calling assistant with tool transparency log
│   ├── resume-agent.js # Resume fit analyzer with structured JSON schema
│   ├── code-review-agent.js # Multi-dimensional code quality analyzer
│   └── main.js         # Navigation, theme toggle, mobile menu, and live status probes
├── api/
│   └── proxy.js        # Serverless edge function (Cloudflare / Vercel proxy)
├── server/             # Local development proxy server
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── assets/
│   ├── Bill_Klinten_Guduru_Resume.pdf  # Recruiter download resume
│   └── favicon.svg
├── CNAME               # Custom domain config for GitHub Pages
└── README.md
```

---

## Local Development

```bash
# 1. Run local web server
python3 -m http.server 8000
# or
npx serve .

# 2. (Optional) Run local AI proxy server
cd server
npm install
cp .env.example .env   # Add your GEMINI_API_KEY
npm start              # Runs on http://localhost:3001
```

---

## License & Source

Source available for reference and review. All personal project code © 2026 Bill Klinten Guduru. All Rights Reserved.
