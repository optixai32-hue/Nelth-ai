# Python -> TypeScript Dependency Matrix (Onyx Standard backend)

Source: `/home/z/onyx/pyproject.toml` (project dependencies + `backend` dependency-group).
Rule: no Python runtime, no Python sidecars, no Docker in the final implementation.

## Core framework layer

| Python package | Version | Usage in Standard | TypeScript replacement | Difference |
|---|---|---|---|---|
| fastapi | 0.133.1 | REST API routers | **hono** (Bun runtime) | Hono handlers; SSE via ReadableStream |
| uvicorn | 0.49.0 | ASGI server | **Bun.serve** | native HTTP server |
| pydantic | 2.12.5 | request/response validation | **zod** | schema validation, compatible shapes |
| SQLAlchemy | 2.0.50 | ORM / data models | **pg** driver + typed row mappers + SQL | ORM dropped; same SQL semantics (mappings documented in migrations) |
| alembic | 1.18.4 | schema migrations | **custom runner** (`db/migrations/runner.ts`) | ordered versioned SQL, `alembic_version`-equivalent table |
| psycopg2-binary / asyncpg | 2.9.10 / 0.30.0 | Postgres driver | **pg** (node-postgres) | same wire protocol |
| celery | 5.5.1 | background tasks + beat | **background/** task registry + DB-backed queue (FOR UPDATE SKIP LOCKED) + recurring scheduler | redis broker replaced by durable Postgres queue (documented deviation) |
| croniter | 6.2.4 | recurring task schedules | **native cron parser** (`background/scheduler.ts`) | supports standard 5-field + shortcuts |
| redis (py client) | 5.0.8 | cache + broker | **key_value_store/redis_compat.ts** in-process KV with Redis-like API | swappable adapter; real Redis optional |
| fastapi-users | 15.0.4 | user/session mgmt | **auth/** native implementation | sessions + API keys with bcrypt hashing (Bun.password) |
| libpass | 1.9.3 | password hashing | **Bun.password (bcrypt)** | same bcrypt algorithm |

## LLM / AI layer

| Python package | Version | Usage in Standard | TypeScript replacement | Difference |
|---|---|---|---|---|
| litellm | 1.100.4 | multi-provider LLM routing | **llm/factory.ts** native provider registry (z-ai backend SDK default; OpenAI/Anthropic-compatible adapters via fetch) | provider set bounded; registry extensible |
| openai | 2.38.0 | OpenAI provider | **openai_compat.ts** (fetch, OpenAI wire format) | streaming + tools supported |
| cohere | 7.0.5 | reranking/embedding provider | adapter interface in `indexing/embeddings.ts` / `search/rerank.ts` | provider optional |
| tiktoken | 0.13.0 | token counting for chunking | **gpt-tokenizer** (pure JS, o200k/cl100k bases) | same BPE counts for supported bases |
| chonkie | 1.0.10 | chunking helpers | **indexing/chunker.ts** native port of Onyx chunking semantics | algorithm ported, not the library |
| google-genai | 2.18.1 | Gemini provider | registry adapter (fetch) | optional |
| mcp / fastmcp | 1.30.0 / 3.4.10 | MCP client/server | **mcp/client.ts** bridge (JSON-RPC over stdio/HTTP) | subset |
| agent-client-protocol | >=0.7.1 | agent streaming protocol | native SSE packets (Packet model port) | same packet shapes |

## Ingestion layer

| Python package | Version | Usage in Standard | TypeScript replacement | Difference |
|---|---|---|---|---|
| markitdown[pdf,docx,pptx,xlsx] | 0.1.7 | file -> text extraction | **file_processing/extract_text.ts** native: txt/md/csv/html/json; pdf via PDF text extraction | docx/pptx/xlsx extraction stubbed (remaining work) |
| pypdf / pypdfium2 | 6.21.4 / 5.9.0 | PDF parsing | pdf text extractor (page-wise) | layout fidelity lower; documented |
| beautifulsoup4 | 4.12.3 | HTML parsing (web connector, cleaning) | **node-html-parser** | equivalent DOM API subset |
| trafilatura | 1.12.2 | webpage extraction | readable-content heuristic extractor | documented quality deviation |
| python-docx/pptx/openpyxl | - | office extraction | NOT ported this session (remaining work) | - |
| python-slugify | 8.0.4 | slug generation | native `slugify()` util | same output rules subset |
| chardet | 5.2.0 | encoding detection | **Bun/textDecoder + heuristic sniff** | subset |

## Infrastructure layer

| Python package | Version | Usage in Standard | TypeScript replacement | Difference |
|---|---|---|---|---|
| opensearch-py | 3.2.0 | keyword/search index client | **pgvector + tsvector adapter** behind document-index boundary | engine swapped (sandbox constraint); boundary/API preserved |
| boto3 / aiobotocore | 1.43.3 / 3.8.0 | S3 file store | **storage/file_store.ts** local-FS default + S3 adapter interface | S3 not exercised in sandbox |
| python-json-logger | 4.1.0 | structured logs | **utils/logger.ts** JSON logger | same field names where applicable |
| prometheus_client | >=0.21.1 | metrics | `/metrics` counters route (minimal) | subset |
| sentry-sdk / openinference / opentelemetry-proto | - | observability | documented stub hooks | remaining work |
| httpx / aiohttp / requests | - | outbound HTTP | **fetch / Bun-native** | - |
| tenacity | 9.1.2 | retries | native retry helper | same exponential backoff semantics |
| pydantic-monty, docker, kubernetes, grpcio, protobuf, microvm stack | - | sandboxed code execution / Craft Firecracker | NOT portable in this sandbox (remaining work, documented) | - |

## Explicitly EXCLUDED (Lite scope)

`docker-compose.onyx-lite.yml` profile and its enablers (`DISABLE_VECTOR_DB`,
`CACHE_BACKEND=postgres` Lite semantics) are intentionally absent from the port.

## Install set for `mini-services/onyx-ts`

hono, pg, zod, gpt-tokenizer, node-html-parser, z-ai-web-dev-sdk (LLM backend SDK).
