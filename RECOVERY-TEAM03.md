# Team 03 — SmartTax AI repair report
Task: LOCAL-4TEAM-WEBSITE-REPAIR. Executor: Codex native/authorized Node-01 runner. Ollama role orchestration and acceptance remain owned by the root coordinator.
Repository: /mnt/data1/Projects/smarttax-ai; origin: hoalong08012019/smarttax-ai.
Clean baseline: 81c9b756ce03216eb2ac51aa9bafddd4fc8544c2 (main).
Isolated branch: recovery/local-team03; worktree: .agent-worktrees/team03.

## Verified R0–R2 changes
- Anonymous, forged test-tenant headers and invalid/mock JWTs no longer gain tenant access. Auth is validated against Supabase Auth; tenant/role is resolved with the user's bearer token under RLS. Privileged indexing requires server-verified ADMIN role.
- Removed browser-shipped root passcode and sessionStorage admin trust; server verifies admin sessions. Preserved real login token through the App callback; missing/demo tokens cannot mint a user session.
- Central configurable API origin replaces browser loopback URLs. Frontend env names: VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
- Failed invoice/bank upload, indexing, advisor and XML download no longer fabricate successful records, advice or filings. Unverified autopilot returns 503 and cannot manufacture accepted receipts.
- RAG embedding/retrieval/indexing/LLM failure now fails closed; persistence must be verified. Provider errors are sanitized.
- Bounded 10MiB uploads, 5MiB XML entries, 100-entry/20MiB ZIP expansion, compression-ratio limits, DTD/entity rejection and mandatory invoice identity.
- Repaired missing favicon/robots/sitemap assets; accessible names on critical login inputs. Added a visible DEMO boundary around the remaining prototype data/actions.
- Updated npm lockfile and patched vulnerable Python dependencies. Local evidence/config/cache paths excluded from Git; no secrets staged.

## Acceptance evidence
All listed final checks exited 0:
- 9 auth unit tests (RED reproduced 8 failures + 1 missing admin guard before repair).
- 6 XML safety tests (RED reproduced 5 failures before repair).
- 4 RAG integrity tests.
- 7 real FastAPI integration test methods, including 18 anonymous/test-tenant/invalid-token route matrix cases, verified admin role, CORS and upload rejection.
- 11 frontend behavior assertions (auth failures cannot mint sessions, real token preservation, API origin, upload failure and autopilot integrity).
- 5 real loopback HTTP checks via temporary Uvicorn server.
- npm ci; npm lint; TypeScript build check; Vite production build.
- Browser at 360px and 1280px: no overflow, login fails closed, admin denied without token, no page exceptions; favicon/robots/sitemap return correct media types.
- npm audit: 0 known vulnerabilities after non-force lockfile repair.
- pip install, pip check, pip-audit: 0 after explicit advisory-compatible dependency updates.

Reproduction:
npm ci --ignore-scripts
npm test
npm run typecheck
npm run lint
npm run build
npm run test:browser
A Python environment with backend/requirements.txt: python tests/run-backend.py
Browser smoke uses locally installed Chrome and portable shared libraries; environment paths in the script are Node-01 defaults. No production browser session or financial submission is used.

Evidence under .artifacts/, ignored by Git, includes inventory.json, browser-smoke.json, backend-http.json, final logs and SHA256 manifest. Screenshots login-360.png and login-1280.png.

## Deployment mapping and exact limitations
Public https://smarttax-ai.vercel.app returns 200 and SmartTax title/assets matching this repository.
GitHub's latest Production deployment 6755018412 records SHA 81c9b756ce03216eb2ac51aa9bafddd4fc8544c2 with successful Vercel check and deployment 45X5fWwh5UZUALRTigVGsF4Anru3.
Current production alias SHA is UNKNOWN: exact Vercel metadata is outside the connector's authorized scope. Default project search returned empty; explicit van-hoa-long-s-projects request returned 403; the immutable deployment URL redirected to Vercel SSO while the public alias was reachable. These alternatives do not prove current alias identity.
This is an access blocker for exact production diff/rollback selection, separate from source test results. Minimum owner action: connect Vercel read access for van-hoa-long-s-projects (team_DUZ4USFfrEpqNrrF88OaEFIq).

Remaining prototype actions/data are explicitly DEMO. Live financial/certificate/filing acceptance is NOT verified and needs separate R4 authority and real approved integration/tenant credentials. No accounting rule, legal advice, filing, certificate, database, permission or financial decision was executed on real data.

## Release boundary
No production deploy/cutover or database migration performed. R3 approval remains mandatory. Backend deployment and env provisioning must preserve the fail-closed contract; restricting existing anonymous/demo authentication intentionally changes access behavior.
Rollback: after current deployment identity is independently confirmed, revert candidate commit / restore the prior approved Vercel deployment and previous backend dependency lock/environment. No data rollback is needed for this code-only task.
Status: safe source checks passed; complete website/production acceptance remains BLOCKED by exact alias metadata access and unverified live financial integrations. Do not mark production VERIFIED_FIXED.
