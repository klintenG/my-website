# Native Project HER production handoff

## Implemented and published

The production studio is **https://klinteng.com/projects/project-her/#studio**. Initial portfolio commit `36065b7` was pushed by the user and deployed through GitHub Pages. The homepage stays familiar and links internally with **Try Project HER**. Projects and Playground point to the same native case-study studio, with `#examples`, `#how-it-works` and `#engineering`. Unrelated experiments remain. No iframe, duplicate generator, external creation redirect or fake result is used.

The existing static HTML/CSS/JavaScript stack is retained; React remains inside Remotion. Changes: `index.html`, `projects/index.html`, `playground/index.html`, `projects/project-her/index.html`, `js/config.js`, `js/main.js`, `js/project-her-client.js`, `js/project-her-studio.js`, `css/project-her-studio.css`, native API/schema docs and browser tests. Simple/Advanced options reflect actual backend compatibility. The previous genuine Zheng Yi Sao sample is clearly labeled and separate from current-job results.

The final follow-up changes documentation and `nativeIntegrationVerified` to true based on actual hosted success. Publishing that follow-up uses the existing main/GitHub Pages flow; it needs no backend redeployment. Check the follow-up's commit/push status before assuming these documentation changes are published.

## Backend and actual contract

HER source: `/Users/klinten/Desktop/My-projects/project-HER`. Current deployed Cloud Run revision: **project-her-00014-ddb**, project `project-her-510715`, `us-central1`. Existing capacity remains 2 CPU/4Gi, min/max instances 1, always-allocated CPU, HTTP concurrency 20. Native admission and Remotion worker concurrency are 1.

Base: `https://project-her-svnnlerw4q-uc.a.run.app/api/portfolio`.

| Endpoint | Verified behavior |
|---|---|
| GET `/config` | Supported options/defaults/limits and actual readiness; fail closed if mandatory provider/storage/security configuration is absent. |
| POST `/jobs` | Allowed Origin + JSON + unguessable `Idempotency-Key`; returns 202 job ID, scoped access token, expiry, status and cancellation support. |
| GET `/submission` | Same-key recovery of ambiguous acknowledgement without a second admission. |
| GET `/jobs/<id>` | Scoped Bearer access; queued/running/completed/failed/cancelled, real stage and completed media metadata. |
| GET `/jobs/<id>/events` | Authenticated fetch SSE, real events, finite streams; polling fallback. |
| POST `/jobs/<id>/cancel` | News only; cancellation request and final confirmation are separate. |
| GET/HEAD `/jobs/<id>/media/<kind>` | Short-lived media ticket, range requests and attachment download; renew through authorized job status. |

Schema and exact fields: `docs/project-her-request.schema.json` and `docs/project-her-native-api.md`. Defaults: News, informative/storytelling, vertical, auto duration, Remotion/reference editorial, progressive editorial text, automatic assets/source, configured Replicate/Kokoro and no music. General Claymorphism applies to Classic; News uses its own reference art direction. Input max 6000 characters/16000 request bytes; URL max 2048; target 0 or 15–90 seconds, actual duration may differ. News scripts max 220 words; output max 180 seconds.

Backend additions: `agent/portfolio_api.py`, `agent/portfolio_store.py`, storage requirements, deploy/smoke scripts and tests. `web_ui.py` integrates the native API, CORS, production legacy operator lock and path security. Firestore stores durable scoped state and quotas; private GCS stores completed output, independent of ephemeral Cloud Run files. Output access expires after 48 hours; object/TTL deletion is asynchronous. Secret Manager holds signing/operator/Replicate credentials; secrets never enter the portfolio.

Server limits: 10 total admissions/day, 2/network identity/day, 1 concurrent job, failed jobs count. A durable policy kill switch controls public creation. Trusted proxy hops stay conservatively 0, so shared proxies may share quotas. These are admission limits, not an exact currency budget. SSRF/input/origin/capability isolation, heartbeat/deadline/cancellation and owned scratch cleanup are enforced. Interrupted computation fails rather than being silently replayed.

## Actual production evidence

All three jobs were submitted by the actual published studio using a short supplied fictional cup/bowl description and a 15-second target. Only explicitly approved generations were submitted.

- `9105035229db4bc58b228da01a306079`: failed before speech due to absent runtime Replicate credentials. Real production failure/refresh UI passed with no completed player and no additional submission. The repair securely bound the existing credential and added mandatory readiness validation.
- `3744786da9ef44ada8a00e8e4be154d2`: reached composition, then Cloud Run used 4176 MiB against its 4096 MiB limit. The repair releases completed inference caches and uses one native render worker without increasing CPU/RAM capacity.
- **`2529226b31c14ef48e2c8a3aae184a6e`**: additional explicitly approved generation **completed** in approximately 516 seconds. Observed snapshots: queued → running → script → narration/alignment → completed. Unobserved intermediate stages are not invented. Actual H.264/AAC MP4: **25.749 seconds, 1080×1920, 2,727,367 bytes**. Range HTTP 206 and attachment headers passed. SHA-256: `899b3b0d2ec569340e6fbbc34168232bb6b0891c5e3c2942ced87c5c07b8580d`.

The first completed-job browser attempt failed transiently. A read-only repeat against the same job passed: Chromium on the actual published portfolio restored the job, played its private MP4 and downloaded the same bytes while staying on klinteng.com. It made **zero new POST /jobs requests**. Public creation remains enabled with enforced quotas.

Private local evidence (not committed/published): HER `output/native-portfolio-smoke-final/smoke.json`, `generated.mp4`, `temp/native-browser-final-proof.log` and `temp/native-live/production.png`. Detailed deployment/build/failure record: HER `docs/native-portfolio-rollout.md`. No signed media URL or scoped capability is published.

## Validation

- 232 Python tests passed, including provider readiness, cache/concurrency, resume-never-submits, security/state/range/cancel/expiry and existing regressions.
- 66 portfolio route/width checks and 13 intercepted native scenarios passed, including 320/375/430/768/1024/1440px, keyboard/focus/overflow, refresh, errors/quota/unavailable and SSE fallback. These are fixtures, distinct from the live success above.
- Typed adapter checkJs, Remotion TypeScript, JS syntax/diff checks and a five-frame editorial render using existing assets passed. npm audit reported 0 vulnerabilities with Remotion 4.0.535 and compatible locked fixes.
- Actual deployed storage/readiness, allowed CORS, foreign origin 403, invalid input 422, missing capability 404 and legacy lock 401 passed. Actual UI admission/SSE/completed media/player/download passed.
- No portfolio production build exists: GitHub Pages serves static files. Proxy-IP trust remains conservative rather than guessed. One controlled short job does not establish reliability for every topic, URL, duration or provider load.

## Deployment and future checks

Backend is already deployed. Future reviewed full-source rollout:

```sh
cd /Users/klinten/Desktop/My-projects/project-HER
.venv/bin/python scripts/deploy_native_portfolio.py
# Read-only plan.
.venv/bin/python scripts/deploy_native_portfolio.py --approve-cloud-changes
```

The script securely provisions/binds required provider secrets, preserves existing providers/settings, and configures private storage/legacy lock/warm instance. One minimum instance incurs idle billing, approved by the user.

Portfolio follow-up publication:

```sh
git -C /Users/klinten/Desktop/My-projects/my-website push origin main
```

GitHub Pages deploys main; preserve CNAME and do not force push. GitHub authentication may require the user's authenticated terminal/VS Code. No additional paid generation is needed for documentation publication.

Read-only backend check: `.venv/bin/python scripts/smoke_native_portfolio.py`. To recover a previously submitted job, `--resume-ui-job <id>` consumes that job's scoped token from stdin and never submits another job. Do not rerun a creation command after a monitoring disconnect. No credentials, local databases, generated visitor files or rollback snapshots should be committed.
