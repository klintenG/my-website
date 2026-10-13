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
        // ---- Links ----
        links: {
            github: 'https://github.com/klintenG',
            linkedin: 'https://www.linkedin.com/in/bill-klinten-guduru-2b361a229',
            email: 'mailto:klintenguduru@gmail.com',
            portfolioRepo: 'https://github.com/klintenG/my-website',
            resume: '/assets/Bill_Klinten_Guduru_Resume.pdf',
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

        // Publication gate: only set isSampleVerified after checking provenance,
        // public media rights, output playback and any edits. Promo is never proof.
        projectHer: {
            liveUrl: 'https://project-her-svnnlerw4q-uc.a.run.app/', // Technical deployment reference only.
            studioUrl: '/projects/project-her/#studio',
            apiBase: isLocal ? 'http://127.0.0.1:7860/api/portfolio' : 'https://project-her-svnnlerw4q-uc.a.run.app/api/portfolio',
            nativeIntegrationVerified: false,
            screenshotUrl: '/assets/project-her-application.webp',
            sampleVideoUrl: '/assets/project-her/zheng-yi-sao.mp4',
            sampleTitle: 'Zheng Yi Sao · 56.1s',
            posterUrl: '/assets/project-her/zheng-yi-sao-poster.jpg',
            sampleInput: "What if I told you that one of history's most powerful pirates wasn't a man… but a woman who commanded hundreds of ships?\nHer name was Zheng Yi Sao.\nIn 1807, after her husband's death, she took control of a massive pirate fleet in the South China Sea.\nThe Chinese emperor sent warships to destroy her.\nBut her pirates fought back, defeating multiple imperial fleets.\nFor years, her forces terrorized merchant ships and coastal towns.\nEventually, the Chinese government intensified its campaign, while rivalries weakened her pirate alliance.\nAnd then something extraordinary happened.\nIn 1810, Zheng Yi Sao negotiated a pardon.\nShe was allowed to retire, keep much of her wealth, and escape punishment.\nThe shocking twist?\nWhile famous pirates like Blackbeard died violently, Zheng Yi Sao walked away from piracy alive, wealthy, and free.\nShe lived until 1844.",
            sampleMetadata: "Zheng Yi Sao · 56.128s · 1080×1920 · 30 fps. Local Remotion re-render, 13 October 2026, using saved HER narration and AI-generated illustrations. Not documentary imagery; historical claims and artwork have not been independently verified. Original MP4 copied without edits.", // capture date, settings, provenance and edits
            sampleCaptionsUrl: '/assets/project-her/zheng-yi-sao.vtt', // WebVTT captions for narration
            sampleTranscript: "What if one of history's most powerful pirates was not a man, but a woman commanding hundreds of ships? In 1807, Zheng Yi Sao assumed control of a massive pirate fleet within the South China Sea. The Chinese emperor dispatched imperial warships to dismantle her growing maritime power. Yet, her forces proved resilient, successfully defeating multiple imperial fleets in open combat. For years, her alliance terrorized merchant vessels and coastal towns across the region. Eventually, government pressure intensified while internal rivalries began to weaken her pirate coalition. In 1810, Zheng Yi Sao achieved the extraordinary by negotiating a formal pardon. She retired with her wealth intact, escaping the violent fate often met by famous pirates like Blackbeard. She remained free and lived until 1844, defying the typical end for such a notorious figure.",
            isSampleVerified: true,
        },
    };
})();

// Classic scripts can read the lexical binding; explicitly expose it for
// page controllers that use window.SITE_CONFIG as well.
window.SITE_CONFIG = SITE_CONFIG;
