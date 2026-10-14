# Native HER API: confirmed contract and operational boundary

The portfolio is static HTML/CSS/JavaScript on GitHub Pages. `frontend/` is not its application framework and the existing Node Gemini proxy is not deployed as a portfolio runtime. The native studio therefore uses a small typed JavaScript client with direct HTTPS calls to an allowlisted Flask API on the existing Cloud Run service. There is no iframe, external creation redirect, React migration or fake progress.

## Confirmed existing backend

Inspected `/Users/klinten/Desktop/My-projects/project-HER/web_ui.py`, its standalone frontend, tests, `agent/news_pipeline.py`, `agent/editorial/pipeline.py`, the general orchestrator and Dockerfile. Existing endpoints:

| Method/path | Verified existing behavior |
|---|---|
| POST `/api/generate` | JSON input/options; returns `job_id`; dispatches Classic or News. |
| GET `/api/progress/<job_id>` | SSE events named `progress` and `done`; real stage name/label/index/status and result. Existing queue is consumptive, process-local. |
| GET `/api/result/<job_id>` | 202 `{status:running}`, final result/error JSON, or 404. |
| POST `/api/news/cancel/<job_id>` | Sets the News cancellation event; returns `cancelling`, not finished cancellation. |
| GET `/api/download/<job_id>` | Attachment from temporary local output. |
| GET `/output/<filename>` | Local byte-range media. Hardened to reject traversal and cross-job basename fallback. |

Legacy jobs, quotas and artifacts were not durable and had no per-visitor job authorization. The native API deliberately does **not** expose those interfaces anonymously. Production rollout sets `HER_PORTFOLIO_LOCK_LEGACY=1`; operator Basic authentication is required for legacy API/output routes. Local development behavior remains unchanged unless that flag is explicitly enabled.

## Native scoped API, version 1

Base: `https://project-her-svnnlerw4q-uc.a.run.app/api/portfolio`. These routes are implemented in `agent/portfolio_api.py`; readiness, CORS, request validation, scoped access rejection and the legacy lock have now been checked against the deployed backend. Production job `2529226b31c14ef48e2c8a3aae184a6e` completed on revision `project-her-00014-ddb`; actual portfolio playback, byte-range delivery and matching browser/API downloads passed on 14 October 2026.

| Method/path | Contract |
|---|---|
| GET `/config` | `version:1`, `enabled`, actual supported choices/defaults, `classic_defaults`, enforced limits and cancellation support. Returns 503 if secure storage/access/alignment prerequisites are missing. |
| POST `/jobs` | Required allowed `Origin`, JSON body and random `Idempotency-Key` header. 202 `{job_id,access_token,expires_at,status,cancel_supported}`. Same key + same input returns the same job without another quota reservation. Changed input with the same key is 409. |
| GET `/submission` | `Idempotency-Key` header recovers an ambiguous acknowledgement using the same unguessable submission key. Network/proxy changes cannot create a duplicate job. No prompt or long-lived credential is placed in the URL. |
| GET `/jobs/<id>` | `Authorization: Bearer <job-scoped token>`. Returns exact stored state/stage/result; missing/wrong access is 404, expired job 410. |
| GET `/jobs/<id>/events` | Same bearer header using streaming `fetch`. Named `progress`/`done` events carry the same durable state. Finite 55-second streams reconnect; polling uses the same record. No synthetic stage percentages. |
| POST `/jobs/<id>/cancel` | Same bearer header and allowed Origin. News only; 202 `cancelling`. Final state confirms actual cancellation. Classic returns 409 and the UI does not offer its cancel action. |
| GET/HEAD `/jobs/<id>/media/<video\|poster\|captions>?ticket=…` | A 30-minute signed, job/media-scoped ticket. Range/HEAD supported; 206/416 correctly describe byte ranges. `download=1` returns attachment headers. Tickets are renewed by querying the authorized job. |

A status response contains `job_id`, `status`, `stage`, `result`, `error`, `created_at`, `updated_at`, `expires_at`, `cancel_supported` and `cancel_requested`. Status values are `queued`, `running`, `completed`, `failed`, `cancelled`. A real stage contains `name`, `label`, `status`, and actual stage `elapsed`; no stage message, prompt, provider diagnostics, source filesystem path or invented progress is exposed. A completed result has backend title/duration/resolution/language and scoped media URLs. Assets are published only after durable upload succeeds.

Native request schema: see `project-her-request.schema.json`. Default News/reference-editorial requests are informative, vertical, automatic duration (`0`), Remotion, progressive editorial phrases, automatic assets/sources, Replicate and no music. Inputs are trimmed and limited to 6000 characters / 16000 request bytes; a URL is at most 2048 characters. Target duration is 0 or 15–90 seconds. Reference editorial requires Remotion/vertical. News scripts are hard-limited to 220 words before speech/assets; delivered videos must be at most 180 seconds. The classic engine uses its backend-configured narration provider; language/speed/music overrides are News-only and disabled in that mode. General art style applies to Classic, not the News art direction. Local registries, arbitrary paths, provider keys, model overrides and unsupported content modes are rejected.

## Costs, access and durable storage

- Global daily budget: 10 admissions; network-identity limit: 2/day; concurrent rendering: 1. Reservations and idempotency are transactional, shared across instances/restarts, and failures still count. Set a limit to 0 or disable `HER_PORTFOLIO_ENABLED` to pause creation. A durable `policy.disabled` record is also a kill switch. Existing authorized outputs remain accessible when creation is paused.
- Identity is HMAC of the socket peer by default, with IPv6 /64 grouping. Client-supplied leftmost forwarding addresses are not trusted. `HER_TRUSTED_PROXY_HOPS=0` is conservative; visitors behind the same proxy may share a limit. Do not increase it without verifying the ingress chain. Global admissions still bound spend even if visitor identities change.
- Firestore stores job state, heartbeat, quotas, request digests and capability metadata, **not raw user inputs**. Native rendering uses a killable child process, a 45-minute hard deadline, heartbeats and a 120-second worker lease. Interrupted accepted work is reported as failed and never automatically replayed. Each cloud child uses job-scoped prompt/media caches. The supervisor removes its scratch output and owned Remotion staging files after the worker exits, including timeout/cancellation paths; durable outputs remain in private Storage. News cancellation has a 20-second graceful window before worker termination; provider cancellation/charges can outlive the local process until the provider deadline.
- Private Cloud Storage contains the completed MP4/poster/captions under `portfolio/<job-id>/`. No public bucket/object access is required. The application expires access after 48 hours; bucket lifecycle removes that prefix after two days and Firestore TTL removes expired records asynchronously. SQLite/local files are explicitly development-only; Cloud Run fails closed without Firestore/private storage, signing configuration, a cached exact-alignment model, and the legacy lock.
- Allowed browser origins are `https://klinteng.com` and `https://www.klinteng.com`. CORS is not treated as authorization. Job capabilities provide isolation; quota transactions protect anonymous creation. Provider secrets stay in Cloud Run/Secret Manager. Media links are short-lived capabilities and use no-referrer/no-store headers.
- News retrieval already pins public resolved addresses to TLS connections and revalidates redirects; native Classic article retrieval now uses that same fetcher rather than passing untrusted URLs to the legacy scraper. Private, loopback, link-local/metadata, reserved and nonstandard-port destinations are rejected before quota reservation.

## Client behavior and limitations

`ProjectHerClient` is JSDoc-typed and checked with TypeScript without adding a frontend build. The page controller handles real states, SSE disconnect/reconnect, bounded polling, idempotent acknowledgement recovery, terminal failure/quota/unavailable/expired output, and cleanup on page hide. `sessionStorage` holds only the scoped job capability/identifier or a pending submission key, never input text or provider credentials. A fresh load queries the backend before restoring output. The generated video never autoplays with sound. Download becomes available only after playable metadata loads.

Backend state/storage tests and intercepted browser fixtures are not proof of a hosted generation. The public rollout and one explicit real smoke generation remain necessary before claiming end-to-end production success or changing the status to “Interactive demo”.


## Temporary testing override — 14 October 2026

The user requested daily limits disabled during manual testing. The backend policy `daily_limits_disabled=true` bypasses both daily admission checks while preserving counters, one concurrent render, validation, authorization and the independent emergency pause. GET config reports `limits.daily_limits_disabled`. Re-enable without redeploying:

```sh
cd /Users/klinten/Desktop/My-projects/project-HER
.venv/bin/python scripts/set_native_daily_limits.py --enable
```

Re-enabling applies the original daily limits to retained counts; `--disable` turns them off again. No paid job is submitted by this command.
