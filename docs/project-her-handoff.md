> Historical earlier portfolio pass. The subsequent native integration is described in [project-her-native-handoff.md](project-her-native-handoff.md); its contract/security boundary is in [project-her-native-api.md](project-her-native-api.md). Statements below about an external-only creator refer to that earlier pass.

# Project HER evidence, app changes, and deployment

## Published sample

The owner supplied and approved `project-HER/output/reference_parity_v2/editorial-remotion.mp4` on 13 October 2026. It is copied without edits to `assets/project-her/zheng-yi-sao.mp4` (9,120,878 bytes). ffprobe reports 56.128 seconds, 1080×1920 at 30 fps, H.264/AAC. Full FFmpeg decoding passed. `sample-evidence.json` records the SHA-256, original input, rendered narration, and limits without exposing local absolute paths.

This is a local reference-v2 Remotion re-render that reused saved HER narration, aligned words and generated assets. `scripts/reference_parity_review.py` documents the saved-media workflow. It is not evidence of a newly executed hosted input-to-output job. The imagery is AI illustrative reconstruction, not documentary evidence; historical claims, modern-looking artwork and narration quality have not been newly verified. Known low-confidence word timings are retained. The user approved publication; no independent media-license review is claimed.

The original account was recovered from the baseline `news_preview.json`; the transcript and caption timing came from the render manifest. The JPEG poster is extracted at 7 seconds. WebVTT captions are grouped from saved word timestamps. The original video remains byte-identical. No generic stock or promotional footage was substituted.

The four HER surfaces use controls, playsInline, preload=metadata, a native vertical player, and IntersectionObserver loading near the viewport. Provenance/input/transcript sit in a disclosure. No autoplay or generation requests occur. The real application screenshot remains the no-JavaScript/future-unverified fallback with an MP4 link. Set `isSampleVerified: false` to withdraw the sample. All media fields are centralized in `js/config.js`.

## Standalone repository

The supplied path is `/Users/klinten/Desktop/My-projects/project-HER`. Source inspection confirms **Flask**, not FastAPI, for the Cloud Run UI/API (`web_ui.py`, `templates/index.html`, Dockerfile). The portfolio labels and case study were corrected. React is used by Remotion compositions. Local source differs from the previously captured live UI: its default studio enforces a News/reference-editorial preset.

The UI changes preserve that exact default request/profile and the existing generation, News, narration and rendering backend. Basic settings map to existing request fields. Customized settings use the existing general API contract; reference editorial validates Remotion + vertical before submission. Advanced exposes mode, renderer, research, editorial text/assets, narration provider, music and local registry. The `/classic` full creator route remains accessible for all legacy controls.

The return link has a fixed case-study destination. An external sample link offers no-cost inspection. No URL-provided redirect is accepted. Existing examples only fill input and are labeled unvalidated. Failure/quota/cancelled states remain visible with input preserved. Cancellation requests are not reported as completed until the backend returns cancellation. Result/download appears only after a safe same-origin output URL loads playable metadata. Unknown measurements stay unreported, output errors show failure, and no autoplay is used. Stage progress uses actual SSE data; polling does not invent a rendering stage or percentage.

Backend review found in-memory jobs/results and per-process visitor/day/concurrency limits. They are not durable/distributed and preview exposure, client-IP trust, input/spend budgets and restart recovery remain follow-up work. The 900-second Gunicorn image timeout and one-worker/eight-thread setup do not establish actual deployed Cloud Run resource settings. No speculative backend lifecycle/security changes were made.

## Checks and deployment

See `project-her-audit.md` for recorded commands/results. The portfolio is buildless static HTML/CSS/JS; it has no production-build, lint or typecheck script. HER provides an offline Python suite and Remotion TypeScript checking; browser fixtures intercept every API call and never generate paid output.

Portfolio: review and commit the changed pages, shared JS/CSS, approved assets, documentation and tests, then use the existing GitHub Pages source/workflow. Preserve CNAME and root-relative routes. Publish the portfolio before releasing the app's sample link. Exclude temporary files, `.env`, node_modules and review-private.

HER: review `templates/index.html`, the two render-context fields in `web_ui.py`, and the new browser regression test/notes. Build/deploy with the repository's existing Cloud Run workflow and configuration; no cloud settings were changed. Then verify actual navigation, optional settings and failure states. Explicit permission is still required before a paid hosted generation test.

No production deployment or paid generation was performed.
