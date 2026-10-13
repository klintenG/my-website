# Project HER portfolio and creator audit — 13 October 2026

## Scope and source

Portfolio: `/Users/klinten/Desktop/My-projects/my-website`, static HTML/CSS/JS served through the existing GitHub Pages setup (`CNAME: klinteng.com`). No frontend build, lint or typecheck scripts exist. Shared design tokens use Inter/JetBrains Mono, slate/ink surfaces, restrained gold and a 768px mobile-navigation breakpoint; they are retained. `frontend/` has empty source/public/dist directories and leftover dependencies. No AGENTS.md was found in either project.

The user subsequently supplied `/Users/klinten/Desktop/My-projects/project-HER` and approved `output/reference_parity_v2/editorial-remotion.mp4`. This resolves the initial missing-source/media boundaries. The standalone source was inspected before modification; writes outside the portfolio workspace went through the native sandbox approval mechanism.

## Verified observations and changes

The initial local portfolio and live HTML agreed: HER already led Selected Work; DocViz preceded HER in Projects; case-study CTAs detoured through Playground; Playground kept hidden generator markup and fabricated completion fields; shared JS retained speculative generation/progress behavior. These have been replaced with one homepage feature panel, HER first in Projects, direct hosted links, an evidence-led case study and a compact Playground launcher. RCA, DocViz, filters, slugs, and unavailable experiment states remain.

The public HER landing page returned HTTP 200 and exposed creator/News/editorial controls. Its screenshot was captured in idle state, with non-GET and generation requests blocked. The local HER source now has a simpler fixed editorial studio and differs from the captured live UI. No live deployment of these changes has been claimed.

Source inspection corrects the old FastAPI attribution: Cloud Run's Dockerfile starts `gunicorn web_ui:app`, and `web_ui.py` uses Flask. React belongs to Remotion composition. The general orchestrator and News/editorial pipeline are separate modules. Editorial uses Pydantic timelines, narration/word marks, source/asset provenance, local staging and frame composition. The portfolio now states the actual inspected architecture.

Jobs and result dictionaries live in memory; worker threads emit SSE stage events and the client falls back to polling. News cancellation sets a threading event checked by the pipeline. Docker runs one Gunicorn worker/eight threads with a 900-second timeout; actual deployed CPU/memory/scaling configuration was not verified. Per-process day/visitor/concurrency limits exist, but reset on restart and are not durable shared quotas. Preview/provider exposure and trusted client-IP handling need follow-up; no unrelated backend/security refactor was performed.

## Sample evidence

The owner-approved MP4 is published byte-for-byte unchanged. ffprobe: 56.128 seconds, 1080×1920, 30fps, H.264/AAC, 9,120,878 bytes. A full FFmpeg decode passed. The SHA-256 is recorded in `assets/project-her/sample-evidence.json`; source/copy hashes match.

The original supplied account is recoverable in the saved baseline news_preview.json; rendered narration, word timings and assets are present in the manifests. The reference-v2 review script reuses saved HER narration and illustrative assets for a local re-render. This is authentic rendering evidence, not a newly tested cloud job. The sample contains AI reconstructions, low-confidence alignment marks, historically imperfect artwork and a generic hook. No speed, quality, completion-rate, cost, uptime or commercial-adoption claim is inferred.

Shared publication-gated media config now includes the approved MP4, extracted poster, original input, transcript, metadata and WebVTT captions derived from saved word timing. Video is vertical/native, controlled, inline, non-autoplaying, preload=metadata, and loaded near the viewport. Provenance is visible through a disclosure. The real application screenshot and MP4 link remain without JavaScript. Promotional footage is never used as generated evidence.

## Standalone UX

Default `editorial_studio` requests remain identical and preserve News/reference editorial. Basic settings and Advanced disclosure map to existing request fields; customized `creator` requests use the existing general contract. Reference editorial validates Remotion/vertical compatibility. News research, renderer, editorial text/assets, provider/music and local-registry options are available; `/classic` retains the full legacy creator.

A fixed case-study return link, attribution and no-cost sample link complete the journey. Examples are input fillers, explicitly unvalidated. UI states distinguish submission, real SSE progress, missing connection confirmation, error/quota/cancellation and playable completion. Download is absent at idle and only appears after a valid same-origin artifact loads positive video duration. No autoplay, fabricated metrics or synthetic polling stages. Unknown measurements remain unreported. Backend behavior/secrets and deployment configuration are unchanged; only quota values are added to the page render context.

## Verification

- Portfolio browser smoke: **66 checks passed**, 11 routes at 320, 375, 430, 768, 1024 and 1440px. Actual sample playback and native dimensions validated on all four HER surfaces at all six widths. No overflow or JS errors; keyboard/menu/focus, filters, unavailable experiments, themes, no-JavaScript content, reduced motion and resume passed. No HER network requests occurred on portfolio page load.
- Additional sample checks: captions fetched/parsed, seeking to 7s worked, and below-fold mobile sample network loading was deferred. Source/copy SHA-256 matches; FFmpeg decode passed.
- HER Python: `PYTHONPYCACHEPREFIX=/private/tmp/her-portfolio-pycache .venv/bin/python -m unittest discover -s tests` — **208 passed**. Two initial sandbox fixture-write failures were resolved by the reviewed local test execution; no provider jobs ran.
- HER TypeScript: `remotion/node_modules/.bin/tsc --noEmit -p remotion/tsconfig.json` — passed. No new render/build job was necessary for the template-only app change.
- Browser creator fixture suite: **all six widths passed** for default/custom request contracts, incompatible-format validation, actual SSE stage updates, playable fixture MP4, unsafe-output rejection, quota/cancellation feedback, keyboard/focus, reduced motion and overflow. All 30 fixture submissions were intercepted; no real jobs ran. Fixture completion verifies the UI contract, not hosted generation.
- Initial static link verification: 53 internal links/current-page anchors, launch focus and image alt checks passed. Video asset, captions, poster and provenance paths were subsequently served locally and checked in browser/media verification.
- `node --check` passed for the changed portfolio JS and both browser tests; `git diff --check` passed in both repositories. Screenshots are under `/private/tmp/portfolio-final/` and `/private/tmp/her-creator-qa/`.

No paid API calls, live end-to-end job, cloud resource validation or production deployment occurred. Publish the portfolio through its existing GitHub Pages setup, then deploy the app through its existing Cloud Run procedure. Details and remaining work are in project-her-handoff.md and the HER repository's PORTFOLIO_UI_NOTES.md.
