# Native Project HER implementation and deployment handoff

## Implemented files and routes

Portfolio route: `/projects/project-her/#studio`, with `#examples`, `#how-it-works`, `#engineering` on the same page. The homepage keeps its layout, existing project order, copy and media; only its HER links/runtime note change. Home, Projects and Playground route to the same native studio. There is no second generator, redirect or iframe. The Playground keeps its unrelated experiments and compact HER summary.

- `index.html`, `projects/index.html`, `playground/index.html`: internal Try Project HER / Read case study links; no principal Cloud Run navigation.
- `projects/project-her/index.html`: compact introduction, accessible native two-pane form/workspace, honest empty/progress/failure/result states, one genuine approved sample and preserved engineering content in disclosures.
- `js/project-her-client.js`: typed API adapter, scoped headers, streaming fetch, bounded requests, actual status/media/download/cancel calls and safe output-URL handling.
- `js/project-her-studio.js`: real lifecycle, idempotent submission recovery, SSE/poll fallback, refresh recovery, supported Simple/Advanced choices, explicit limits, no fake progress/results.
- `css/project-her-studio.css`: existing brand/fonts/tokens, responsive 320–1440px layout, visible focus, reduced motion and overflow protection.
- `js/config.js`, `js/main.js`: internal launch target, public API address, unchanged verified sample. `nativeIntegrationVerified` remains false until production testing succeeds.
- `tests/project-her-native.mjs`, `tests/browser-smoke.mjs`: intercepted contract/state fixtures plus existing route/width regressions. They do not create paid jobs.
- `docs/project-her-native-api.md`, `project-her-request.schema.json`: verified existing/native contracts and operational limits.

HER backend repo: `/Users/klinten/Desktop/My-projects/project-HER`.

- `agent/portfolio_api.py`: new scoped native API over the existing News/editorial and Classic engines; public request validation, idempotency, transactional quotas, scoped job/media access, real events, recover/cancel, process deadline/heartbeat, safe errors and legacy operator lock.
- `agent/portfolio_store.py`: SQLite/local media only for development, Firestore/private Cloud Storage required in Cloud Run.
- `web_ui.py`: native blueprint/CORS integration and fixed output path traversal/basename fallback. Legacy local operation and existing standalone UI remain intact; production native mode adds operator authentication to legacy API/output.
- `Dockerfile`, `requirements-portfolio.txt`, `.env.example`: storage dependencies, exact speech alignment/model preparation and explicit fail-closed production configuration.
- `tests/test_portfolio_api.py`: durable state, isolation, quotas, idempotency, origin/URL/input restrictions, byte ranges, cancellation, expiry, kill switch and output-root security.
- `scripts/deploy_native_portfolio.py`: dry-run rollout plan unless `--approve-cloud-changes` is given. No secret values are printed.
- `scripts/smoke_native_portfolio.py`: readiness check only unless `--allow-paid-generation` explicitly allows one real, small generation and actual range/download/FFprobe verification.

No provider services are replaced and no existing provider credentials are copied to the portfolio. The frontend remains buildless/static; React stays in Remotion. General visual style/narration options are disabled where the actual backend ignores them rather than presented as fake functionality.

## Infrastructure discovery and rollout status

Before rollout, read-only checks against project `project-her-510715`, service `project-her` in `us-central1`: public landing page HTTP 200; service URL matches the supplied Cloud Run URL; 2 CPU, 4Gi memory, max instances 1, concurrency 20, CPU throttling disabled. Existing runtime service account is retained. There is no existing dedicated output bucket (only the Cloud Run source bucket was listed). Firestore API is disabled. Those were production prerequisites, now provisioned under the user-approved rollout.

The approved rollout has provisioned Firestore, private output storage, scoped IAM and signing/operator secrets, and deployed the native API. Actual readiness checks pass: enabled configuration/storage access, allowed-origin preflight, foreign-origin rejection (403), empty-input rejection (422), missing job capability (404), and legacy operator lock (401). The final cleanup/renderer hardening revision is being prepared before portfolio publication. No paid generation has been submitted yet; “Interactive demo” and end-to-end success remain unverified.

## Local commands

Portfolio:

```sh
cd /Users/klinten/Desktop/My-projects/my-website
python3 -m http.server 8766 --bind 127.0.0.1
# http://127.0.0.1:8766/projects/project-her/#studio

PUPPETEER_MODULE=/private/tmp/her-browser/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js \
  SITE_URL=http://127.0.0.1:8766 node tests/browser-smoke.mjs
node tests/project-her-native.mjs
```

HER tests and typed client check:

```sh
cd /Users/klinten/Desktop/My-projects/project-HER
.venv/bin/python -m unittest discover -s tests
remotion/node_modules/.bin/tsc --noEmit -p remotion/tsconfig.json
remotion/node_modules/.bin/tsc --allowJs --checkJs --noEmit --lib es2022,dom \
  --target es2022 --module es2022 ../my-website/js/project-her-client.js
```

For real local API work, install `requirements-portfolio.txt`, explicitly enable `HER_PORTFOLIO_ENABLED=1`, set a randomly generated signing key with at least 32 characters in the process environment, and run `.venv/bin/python web_ui.py`. Do not put a signing key in browser code. Development uses SQLite/private files under `temp/portfolio/`. Without explicit configuration, the studio reports unavailable and the approved sample remains usable.

## Production rollout commands (approved by the user)

The prepared backend command is:

```sh
cd /Users/klinten/Desktop/My-projects/project-HER
.venv/bin/python scripts/deploy_native_portfolio.py
# Prints the reviewable plan; performs no cloud mutations.
.venv/bin/python scripts/deploy_native_portfolio.py --approve-cloud-changes
```

The approved opted-in rollout creates/enables:

1. Firestore API and a regional `(default)` native database in `us-central1`; TTL on `her_portfolio.delete_after`.
2. A dedicated **private** `project-her-510715-portfolio-output` bucket with uniform access/public-access prevention; two-day lifecycle only on `portfolio/` output objects.
3. Two Secret Manager entries for native signing/operator access; current runtime account gets only the additional Firestore, bucket-object and new-secret access it needs. Existing provider environment/secrets are preserved.
4. A new revision of the **existing** `project-her` service, using the checked-in Dockerfile. Native API and legacy lock are enabled. Existing 2 CPU/4Gi and max instances 1 are retained; min instances becomes 1, CPU remains always allocated and request timeout becomes 3600s. **One minimum instance changes idle billing.** No new render provider/model is substituted.
5. Global 10/day, network identity 2/day, concurrent job 1, input/script/duration limits and strict exact-word alignment. Default IP handling is conservative; ingress proxy trust is not guessed.

The script retains a private service snapshot outside the repository for rollback. It refuses to mutate an existing bucket unless its project can be verified. It never prints generated keys. Keep the snapshot private; it can contain existing service environment configuration.

Readiness and one controlled real job:

```sh
.venv/bin/python scripts/smoke_native_portfolio.py
# Read-only readiness; no paid work.
.venv/bin/python scripts/smoke_native_portfolio.py --allow-paid-generation
```

After publishing the reviewed portfolio, submit the one small test through the actual production Generate button with `--browser-submit`, and verify that same job (no second submission) with `--browser-check ../my-website/tests/project-her-live.mjs`. The scoped job access is passed to Chromium over stdin and is not persisted or printed; the actual published page must already contain the native studio. It verifies playback and downloads identical bytes while remaining on klinteng.com.

The paid opt-in uses a short supplied fictional cup/bowl demonstration, not a historical claim or unbounded research topic. It submits once with idempotency, records actual stages/status, verifies private range playback and attachment download, saves the real MP4 under `output/native-portfolio-smoke/`, and probes its streams. It prints no job access/media tickets. This test can still fail because of provider quotas; do not resubmit automatically. A fixture success never substitutes for this test.

After backend readiness, publish the reviewed portfolio files through its existing `main` GitHub Pages flow (remote `https://github.com/klintenG/my-website.git`). Preserve `CNAME`. Stage only this change’s listed files, review the diff, commit and push normally; no force push or unrelated changes. Then run `.venv/bin/python scripts/smoke_native_portfolio.py --allow-paid-generation --browser-submit --browser-check ../my-website/tests/project-her-live.mjs` from HER. Validate the actual `https://klinteng.com/projects/project-her/#studio` route, CORS, sample and generated output. Set `nativeIntegrationVerified: true` only after actual production UI generation/playback/download evidence is recorded. Never publish keys, local databases, output test files, rollback exports or review-private files.

## Verification status

- Final Python suite: **227 passed**, including 19 native security/contract cases and all existing regressions.
- Existing portfolio browser regression: **66 route/width checks passed**, including mobile navigation, theme, sample playback, no-JS, reduced motion, filters, resume and unrelated Lab unavailable states.
- New native browser fixtures: **13 scenarios passed**, including six widths, actual approved-MP4 playback as a fixture, real-shaped stage events, refresh without a second submission, failure/quota/unavailable, SSE polling fallback, cancellation, expired media and unsafe-link rejection. API calls were all intercepted, not hosted generation.
- JavaScript syntax and TypeScript `checkJs` for the typed adapter: passed. Existing Remotion TypeScript: passed.
- No portfolio production build exists: the existing host serves static files without a build step. No new framework/build is required.
- Firestore/GCS access, base Cloud Build image and deployed readiness/security: **passed**. Real generation/playback/download: **pending the single controlled test**. Production ingress IP-chain trust remains conservatively unconfigured; no leftmost forwarded address is trusted.

Known boundaries: API requests require allowed origins plus capability authorization, not CORS alone; quotas are job admissions rather than an exact currency bill; failed jobs count; cancellation cannot undo already charged provider work; TTL deletion is asynchronous; existing completed jobs survive restarts but interrupted computation is failed rather than replayed. Monitor job failures, active leases, Firestore/Storage usage, provider throttling and Cloud Run billing after rollout.


## Acceptance matrix before deployment

| Requirement | Status | Evidence |
|---|---|---|
| Familiar homepage with internal Try Project HER CTA | Pass locally | Existing layout retained; 66 route/width checks. |
| One existing case-study route with native studio | Pass locally | Native form/workspace at `#studio`; no iframe or extra generator route. |
| Real deployed job submission/completion | Not run | Deployed API readiness passes; controlled production UI submission is pending. |
| Real deployed SSE/progress | Not run | API/store and streamed fixtures pass; live job SSE check remains pending. |
| Actual hosted output playback/download | Not run | Actual approved MP4 plays in fixture tests; native byte-range/attachment tests pass. New hosted output is pending. |
| Refresh/retry without duplicate submission | Pass in fixtures | Scoped tab storage and idempotency; refresh keeps one POST. |
| News/Classic and supported advanced settings | Pass locally | Actual schema/options, mode compatibility and cancellation support verified. |
| No redirect/iframe creation workflow | Pass | Internal CTAs and native adapter. |
| Invalid/quota/unavailable/SSE-failure/expired-output | Pass in fixtures | Browser scenarios and backend contracts; no synthetic progress. |
| Unrelated routes/experiments | Pass | Existing 66 route/width regression. |
| Secrets/isolation/budgets/SSRF | Pass in local tests | 19 native security cases; deployed readiness, private bucket controls and legacy lock verified. |
| Responsive 320–1440px and keyboard | Pass locally | Six widths, no overflow, labels/focus, native details/video controls. |
| Build/type checks | Pass / not applicable | Static site has no production build; JS syntax, typed adapter and Remotion checks pass. |
| Cloud Build and durable storage | Pass | Base build successful; Firestore/private Storage readiness and lifecycle controls verified. |
| Production ingress proxy trust | Conservative default | Trusted hops remain 0; shared proxies can share a quota. |


## Final hardening checks

Remotion packages are pinned consistently to 4.0.535; compatible transitive security fixes are locked. `npm audit fix --ignore-scripts` reports **0 vulnerabilities**. TypeScript and a five-frame editorial render using existing assets pass; its 1080×1920 full-range BT.470bg output remains compatible with the existing BT.709 conversion. No provider was called for that render. The first image was followed by a small image patch pinned to its immutable digest, containing the final native cleanup code and reviewed renderer lockfile; future full-source deployments use the checked-in Dockerfile and updated lockfile.
