/* ============================================================================
   PORTFOLIO CONFIG — single source of truth
   ============================================================================
   Everything that appears in more than one place on the site (stats, links,
   demo status, API endpoint) lives here so numbers and statuses cannot drift.
   Elements in index.html opt in with data-* attributes:
     data-stat="yearsExperience"      -> text replaced with the stat value
     data-link="github|linkedin|..."  -> href replaced with the link value
     data-resume                      -> href set to the resume PDF
   ============================================================================ */

const SITE_CONFIG = (() => {
    const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

    return {
        // ---- Stats (keep defensible; shown in hero) ----
        stats: {
            yearsExperience: '6+',   // Dec 2019 -> present
            aiAgents: '6',           // AI agents & integrations built (see Selected AI Systems)
            projects: '8+',          // AI & engineering projects described on this site
        },

        // ---- Links ----
        links: {
            github: 'https://github.com/klintenG',
            linkedin: 'https://www.linkedin.com/in/bill-klinten-guduru-2b361a229',
            email: 'mailto:klintenguduru@gmail.com',
            portfolioRepo: 'https://github.com/klintenG/my-website',
            resume: 'assets/Bill_Klinten_Guduru_Resume.pdf',
        },

        // ---- AI demo backend (Gemini proxy) ----
        // Local dev uses server/server.js. In production set `apiUrl` to the
        // deployed proxy (Cloudflare Worker / Vercel — see api/proxy.js).
        // While it is empty the AI Lab shows an honest "temporarily unavailable"
        // state instead of failing on every request.
        api: {
            apiUrl: isLocal ? 'http://localhost:3001/api/chat' : '',
            timeoutMs: 45000,
        },

        // ---- Project HER (flagship) ----
        // status: 'auto'      -> probe the live URL in the browser and show Live / Offline
        //         'live' | 'deploying' | 'offline' -> force a state
        // demoVideo: path/URL of the recorded walkthrough (mp4). Leave '' until the
        //            video exists — the "Watch Demo" button stays hidden meanwhile.
        projectHer: {
            status: 'auto',
            liveUrl: 'https://project-her-793574023262.us-central1.run.app',
            demoVideo: '',
            demoPoster: '',
            probeTimeoutMs: 12000,
        },
    };
})();

// How each project status renders (spec: never show "Running" for an unavailable demo)
const STATUS_RENDER = {
    checking:  { cls: 'checking',  text: 'Checking demo status…' },
    live:      { cls: 'live',      text: 'Live — Try it' },
    deploying: { cls: 'deploying', text: 'Deploying — Watch Demo' },
    offline:   { cls: 'offline',   text: 'Demo temporarily unavailable' },
};
