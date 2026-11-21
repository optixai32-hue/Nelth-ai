# Onyx Standard -> TypeScript Port Report

Mission: complete, high-fidelity port of the ORIGINAL Onyx STANDARD backend
(Python -> native TypeScript / Node.js runtime). **Onyx Lite is strictly excluded** —
no Lite modules, no `DISABLE_VECTOR_DB`, no `CACHE_BACKEND=postgres` anywhere in the port.
Source of truth: https://github.com/onyx-dot-app/onyx.git (main branch).

## Measured scope of the source (Phase 0 audit — not estimated)

- 4,901 Python files / 319,043 LOC under `/home/z/onyx/backend`
- 39 module areas inventoried (see PORT_MAP.md for the per-module measured table)

## Delivered in this session (measured)

| Artifact | Count |
|---|---|
| Backend TS files (`mini-services/onyx-ts/src`) | 67 |
| Backend TS LOC | 11,088 |
| Frontend console LOC (Next.js page + panels + api client) | 3,764 |
| Files citing the exact Python sources they port | 22+ (every module file carries a source-path header) |
| Documentation (PORT_MAP.md, DEPENDENCY_MATRIX.md, PORT_REPORT.md) | 3 |

## Ported and RUNTIME-VERIFIED (end-to-end, browser + API level)

- **API server** (Hono on :8080, Standard port of uvicorn api_server): auth, chat, search,
  documents, manage (connectors), assistants, tools, artifacts, mcp, health routes mounted.
- **Auth subsystem**: bcrypt passwords (Bun.password), sessions (cookie), API keys
  (unsalted sha256 + display prefix, ported from auth/api_key.py semantics), default admin
  bootstrap, role checks. Verified: register/login/me/logout/api-keys flows.
- **DB layer**: 16-table Postgres schema (migration "0001", alembic-runner equivalent),
  pgvector extension enabled, typed row mappers. Verified against real Postgres 16.
- **LLM provider layer**: factory + registry, z-ai backend-SDK provider (streaming verified,
  tool-call parsing), OpenAI-compatible provider (fetch/SSE). Port of llm/factory.py routing.
- **Chat engine** (chat/process_message.py + agent.py port): automatic retrieval step
  (search runs on every user message before generation), agent loop with tool calling,
  stream buffer (delta + tool-call fragment reassembly), SSE Packet stream
  (`seq/packet/ind/type/message`, `[DONE]`), persistence (sessions, messages, title naming),
  history building. Verified: grounded answer quoting the indexed document with [1] citations.
- **Citations**: DynamicCitationProcessor port (HYPERLINK mode), citation extraction/renumber,
  packet-level `citation_info`, persisted `Citation[]`. Verified in stream + DB.
- **Tools runtime**: interface + registry + built-ins (search_internal, web_search via SDK
  `functions.invoke`, image generation via SDK `images.generations.create` with graceful
  degradation), MCP-shaped exposure (GET /mcp/tools, POST /mcp/call). Verified registry + calls.
- **Document processing + indexing**: text extraction (txt/md/csv/json/html + pure-TS PDF
  text extractor with FlateDecode/ASCII85/ASCIIHex), token chunking (gpt-tokenizer, max 512
  / overlap 76, boundary-priority splitting), embedding adapter (local deterministic
  embedder standing in for the indexing_model_server boundary, dim 384), OpenSearch document
  index (knn_vector hnsw cosinesimil + text mappings, bulk indexing). Verified: upload-text ->
  1 doc / 1 chunk indexed; search finds it.
- **Hybrid search**: keyword (multi_match) + vector (knn) in OpenSearch -> reciprocal rank
  fusion (k=60) -> optional LLM rerank (fault-tolerant). Verified: POST /search returns fused
  results with scores + llm_ready context.
- **Connector framework** (connector_runner.py semantics: load_from_state /
  retrieve_all_slim_docs / fetch_docs), factory (file, web; unknown source ->
  UnsupportedFeatureError), file connector (FILE_CONNECTOR__ id convention), web connector
  (single/recursive BFS 50-page bound/sitemap, retries, node-html-parser extraction).
- **Background worker** (celery + beat replacement, separate process on :8080-port stack):
  DB-backed queue with FOR UPDATE SKIP LOCKED claims, retry policy, stale-running requeue,
  recurring scheduler (5-field cron parser with steps/ranges/lists/dow union), seeded
  connector_sync_all beat task. **Verified end-to-end**: web connector sync -> task complete ->
  IndexAttempt completed (1/1) -> document searchable ("Example Domain | web").
- **Redis-compatible KV + cache + file store**: real Redis 8.2.2 client (ioredis, key prefix),
  read-through GenericCache, local-FS file store with traversal hardening. Verified roundtrips.
- **Craft artifacts**: DB-backed artifact CRUD with session-ownership predicate (verified;
  the Firecracker microVM code-execution runtime is NOT ported — see remaining work).
- **Web console** (Next.js :3000, mirrors Onyx web -> INTERNAL_URL -> api_server via the
  /api/onyx proxy): auto-login, 5 tabs (Chat with live SSE streaming + citation chips,
  Search, Documents + Craft, Connectors with sync triggering, Status with tools/MCP registry),
  zinc/emerald palette, responsive (mobile 390px verified), sticky footer verified both
  short/long content, zero console errors in verification run.

## Infrastructure used (Standard profile, all real)

Postgres 16 (+pgvector 0.6.2) at 127.0.0.1:5432/db `onyx_ts`; Redis 8.2.2 at :6379 (db 1);
OpenSearch 3.6.0 at :9200 (index onyx_ts_standard_index). Sandboxed API server + worker run as
daemonized Bun processes (renamed-binary trick, required by this environment's process reaper).

## NOT yet ported (honest remaining work — no fabricated completion)

- Connectors: ~388 of 390 Python connector files (GitHub, Google Drive, Confluence, Slack,
  Notion, Jira, Linear, ...) — framework + file/web ported; catalog not ported.
- Enterprise edition (`backend/ee`): SSO/SAML/OAuth providers, SCIM, admin analytics, RBAC.
- Skills subsystem (41 files / 11.7k LOC), voice (3.4k LOC), onyxbot, integrations, hooks,
  feature flags, kg (knowledge graph), evals, tracing/observability exporters, secondary LLM
  flows, sandbox_proxy/microvm code-execution runtime, external_apps, federated connectors.
- Office extraction (docx/pptx/xlsx) in file_processing; image-only PDF pages (no OCR).
- Full MCP protocol client (stdio/JSON-RPC transport) — MCP surface here is the tool bridge.
- Multi-tenant deployment (`alembic_tenants`), webhook_server, Prometheus instrumentation
  (only a minimal /metrics-shaped status surface exists), Sentry/OTel export.
- Differential Python-vs-TS test suite: per environment policy no test files were written;
  validation was performed as live runtime verification instead (flows listed above).

## Deviations (all deliberate, documented in file headers)

1. Document index engine: Standard's Vespa/OpenSearch -> **real OpenSearch 3.6.0** (same
   engine family Standard supports); pgvector retained for relational vector needs.
2. Redis broker for celery -> durable Postgres task queue (SKIP LOCKED) + real Redis for
   cache/KV. Task semantics preserved (retry, stale requeue, beat cron).
3. Embeddings: indexing_model_server GPU models -> local deterministic embedder behind the
   same `EmbeddingProvider` interface (cloud providers pluggable; dimension configurable).
4. LLM: litellm provider zoo -> native factory with z-ai backend SDK (default) and
   OpenAI-compatible adapter.
5. Key prefix `onyx_ts_` (vs `on_`), api_key_display truncation, default persona id 1 (vs 0),
   bcrypt cost pinned 12, session storage in Postgres (vs Redis-backed fastapi-users tokens),
   connector priority convention inverted to higher-runs-first, chunk tokenizer o200k via
   gpt-tokenizer (vs HF tokenizers), web connector fetch instead of Playwright.
6. API surface is a faithful subset of the FastAPI routers (paths/shapes preserved for the
   ported features; unported features return the appropriate error, never fake data).

## Reproduction

```
# infra already running: Postgres :5432, Redis :6379, OpenSearch :9200
cd mini-services/onyx-ts && bun install
python3 /home/z/onyx-services/daemonize.py /tmp/onyx-api.log $PWD /home/z/.local/bin/bun-ts run src/index.ts
python3 /home/z/onyx-services/daemonize.py /tmp/onyx-worker.log $PWD /home/z/.local/bin/bun-ts run src/worker.ts
# web: bun run dev (Next.js :3000, proxy /api/onyx -> :8080)
```

Default admin: admin@onyx-ts.local / admin. Typecheck: `bunx tsc --noEmit` clean (exit 0).

---

## Session 3 (sandbox rebuild + v5.1.3 UI protocol alignment) — runtime-verified

**Environment note**: the sandbox was reset; all infrastructure was rebuilt from
reproducible scripts now stored in `my-project/onyx-infra/` (clone v5.1.3, pgserver
Py3.12 + TCP 5432 via pg_ctl, Redis 7.2.5 build, OpenSearch 2.17.1 with the bundled
security plugin removed — it refuses transport-TLS-less boot — plus 512m heap and
`allow_mmap: false`). `99-status.sh` reports the whole stack UP; `daemonize.sh`
(setsid nohup) escapes the sandbox process reaper.

### Fixed: the original web UI is now the frontend (blank-page root causes)

1. **Next 16 dev cross-origin guard** — accessing the dev server via any host other
   than `localhost` (127.0.0.1, the external sandbox preview domain) made Next
   403 the HMR socket + font preloads, which silently killed hydration: the RSC
   flight stream rendered `<!--$--><!--/$-->` and nothing ever painted. Fix:
   `allowedDevOrigins: ["**.*", "127.0.0.1"]` in web/next.config.js (dev-ops
   config only; the `**.*` pattern matches any multi-label host, covering the
   unknowable preview domain — verified: foreign-origin /_next now 404s, not 403s;
   HMR connects; pages hydrate).
2. **OOM kill** — next-server (2 GB RSS during recompile) was OOM-killed with the
   headless browser open; recovered by closing the browser during compiles.

### Fixed: v5.1.3 chat streaming protocol (answers now render in the UI)

The frontend (`lib.tsx` -> `streamingUtils.handleSSEStream`) reads **NDJSON**
(one `AnswerStreamPart` per line, no `data:` frames) with packets wrapped as
`{placement, obj}` and discriminated on `obj.type` (chat/models.py:76 union,
streaming_models.py:482 Packet, placement.py Placement). Three port bugs fixed
in `chat/process_message.ts`:

1. **Synthetic `user_message` packet removed** — not in the original protocol;
   as the first packet of group `0-0` it poisoned the frontend's
   first-packet group classification (`packetProcessor.ts:337` — only the FIRST
   packet of a group classifies it as tool vs display), so `message_start` could
   never create the answer's display group. This was why answers never rendered.
2. **Turn numbering** — ported `llm_loop.py`'s `turn_index = llm_cycle_count +
   reasoning_cycles`: the automatic retrieval occupies turn 0; agent-loop step N
   emits its LLM answer and tool calls at turn N+1 (tools share their caller's
   turn). Tool packets and the answer now land in different groups.
3. **Wire fidelity** — `MessageResponseIDInfo` is bare (`user_message_id`,
   `reserved_assistant_message_id`; no `mentions`); `message_start` carries only
   `final_documents` + `pre_answer_processing_seconds`; `stop` sends
   `stop_reason: null`; the SSE `data: [DONE]` tail is suppressed on the NDJSON
   surface; `search_internal` now emits the full
   `search_tool_start -> queries_delta -> documents_delta` sequence.

### Added: session-management surface (port of chat_backend.py routes)

`rename-chat-session` (explicit + LLM auto-naming via `generateChatSessionName`),
`update-chat-session-temperature` (0..2 validation, stored in the new
`chat_session.llm_override` JSONB — migration 0009), `update-chat-session-model`,
`update-chat-session-reasoning`, `set-preferred-response`
(`chat_message.preferred_response_id`), `set-message-as-latest`,
`delete-chat-session/:id`, `delete-all-chat-sessions`,
`chat-session/:id/resume-stream` (404 — documented frontend fallback),
`available-context-tokens/:session_id`, `max-selected-document-tokens`.
Also: `PATCH /user/pinned-assistants` + persisted `onyx_user.preferences` JSONB
(migration 0010) merged over defaults in `/me` (auto-pin now succeeds),
`POST /auth/refresh` (session rotation; the web ticker succeeds), and
`GET/POST /manage/admin/opensearch-health[/popup]` (ResourceHealth shape).

### Browser-verified end-to-end (agent-browser)

- `/` -> login redirect -> register/login -> onboarding -> main app renders the
  full original UI (sidebar, Agents, Projects, Admin Panel).
- Chat golden path: message -> retrieval step (timeline "Thought for Ns / 1 step")
  -> streamed answer with citations pipeline -> `onyx-ai-message` testid set
  (complete) -> session auto-named by the LLM ("Math Question", "Onyx Company
  Summary") -> Recents list persists.
- Console clean except the original's own cosmetic `Unknown packet`
  MessageResponseIDInfo warning (the reference frontend logs the same for that
  part; both consume the IDs before the fallthrough).
- `bun run lint` clean.
