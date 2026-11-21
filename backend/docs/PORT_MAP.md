# Onyx Standard -> TypeScript Port Map

Source of truth: https://github.com/onyx-dot-app/onyx.git (main branch, shallow clone at /home/z/onyx)

**SCOPE: Onyx STANDARD backend only. Onyx Lite (`docker-compose.onyx-lite.yml`, `DISABLE_VECTOR_DB`,
`CACHE_BACKEND=postgres` profile) is EXCLUDED from analysis and implementation. No Lite code paths,
no Lite fallbacks, no Lite/Standard hybrids exist in this port.**

## Phase 0 Audit (measured, not estimated)

- Backend Python files: **4,901** (`rg --files /home/z/onyx/backend -g '*.py'`)
- Backend Python LOC: **319,043**
- Standard-mode architecture (from `deployment/docker_compose/docker-compose.yml`, STANDARD services only):
  api_server (:8080), background (celery worker), postgres, vespa/opensearch (document index), redis
  (cache/broker), inference_model_server, indexing_model_server, nginx (reverse proxy in front of web + api).

## Architecture Boundary Preservation

| Standard component        | This port                                        | Fidelity note |
|---------------------------|--------------------------------------------------|---------------|
| api_server (uvicorn :8080)| `onyx-ts` API server (Bun + Hono, :8080)          | same port, REST surface subset |
| background (celery worker)| `onyx-ts` worker process (`src/worker.ts`)        | separate process, DB-backed task queue replaces redis broker |
| web (Next.js)             | Next.js app (:3000) with `/api/onyx/[...path]` proxy | mirrors Onyx web -> INTERNAL_URL -> api_server |
| postgres (+pgvector)      | embedded Postgres via pgserver (pgvector enabled) | real Postgres, real migrations |
| vespa/opensearch          | `vector_db/` + `indexing/document_index/` adapter over pgvector + Postgres tsvector | boundary preserved, engine swapped (documented deviation) |
| redis (cache/broker)      | `key_value_store/redis_compat.ts` (Redis-compatible API, in-process) | adapter so real Redis can be dropped in |
| inference/indexing model servers | `llm/providers/*` + `indexing/embeddings.ts` adapters | model-server HTTP boundary preserved via provider interfaces |
| nginx                     | Next.js proxy route (INTERNAL_URL pattern)         | same role |

## Module Inventory (measured) and Port Mapping

Source dir = `/home/z/onyx/backend/onyx/<dir>`.

| Source dir | Files | LOC | Target (`src/`) | Ported scope |
|------------|------:|----:|-----------------|--------------|
| configs/ | 14 | 4,430 | configs/ | constants.py + app settings (env-driven), Lite vars excluded |
| db/ | 140 | 65,110 | db/ + migrations | core SQLAlchemy models -> DDL + typed rows; alembic -> ordered migration runner |
| auth (db/auth, server/auth) | part of db/server | - | auth/ | users, sessions, api keys, password hashing |
| chat/ | 29 | 15,302 | chat/ | agent loop, stream packets/emitter, citations, persistence, stream buffer |
| llm/ | 43 | 12,647 | llm/ | provider factory, model registry, request options |
| tools/ | 70 | 21,441 | tools/ | Tool interface, registry, built-in tools (search, web search, image gen) |
| search/ + server/query_and_chat | part of server | - | search/ | orchestration, hybrid retrieval, RRF fusion, LLM rerank |
| indexing/ | 23 | 6,876 | indexing/ | chunking pipeline, embeddings adapter, document index writers |
| document_index/ | 20 | 8,457 | indexing/document_index/ + vector_db/ | index adapters (pgvector + tsvector) |
| file_processing/ | 12 | 2,504 | file_processing/ | text extraction (txt/md/html/csv/pdf subset) |
| connectors/ | 390 | 113,114 | connectors/ | connector framework + factory + file/web connectors (full 100+ connector catalog NOT ported this session - listed as remaining work) |
| background/ | celery app | - | background/ | task registry, DB-backed queue (SKIP LOCKED), recurring scheduler |
| redis/ (client layer) | 17 | 5,272 | key_value_store/ | Redis-compatible KV API |
| cache/ | 5 | 1,285 | cache/ | generic cache with namespace invalidation |
| file_store/ | 12 | 5,281 | storage/ | file store abstraction (local FS default; S3 adapter interface) |
| server/ | 294 | 88,334 | server/routes/ | REST routers subset: auth, chat, search, documents, connectors, admin, personas, tools, artifacts, health |
| mcp_server/ | 9 | 1,169 | mcp/ | tool bridge (server-side tool exposure) |
| deep_research/ | 4 | 880 | deep_research/ | iterative multi-hop research loop |
| craft (microvm/artifacts) | 19 | 7,591 | craft/ | artifact workspace CRUD (Firecracker microVM runtime NOT portable in sandbox - documented) |
| skills/ | 41 | 11,686 | - | NOT ported this session (remaining work) |
| voice/, image_gen/, natural_language_processing/, tracing/, onyxbot/, integrations/, oauth/, sso, kg/, evals/, external_apps/, sandbox_proxy/, hooks/, feature_flags/ | ~150 | ~25k | - | NOT ported this session (remaining work) |
| ee/ (enterprise) | - | - | - | NOT ported this session (remaining work; separate license scope) |

## Port Rules Applied (per master prompt)

1. Every ported module was written by reading the actual Python source (subagents instructed to open
   the real files and preserve algorithms, not invent equivalents).
2. Original names preserved where reasonable (snake_case kept for DB columns/API payloads).
3. No Lite modules, no `DISABLE_VECTOR_DB`, no `CACHE_BACKEND=postgres` anywhere.
4. Deviations are explicit and listed in PORT_REPORT.md, never silent.
