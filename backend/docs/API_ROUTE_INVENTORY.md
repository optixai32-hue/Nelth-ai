# Onyx Standard Backend — HTTP API Route Inventory

> Audit target: `/home/z/onyx/backend/onyx/` (the **Standard / CE** FastAPI app defined by
> `onyx/main.py::get_application()`). Purpose: 1:1 Python → TypeScript port reference.

## How paths are formed

- Every router is mounted via `include_router_with_global_prefix_prepended()`, which prepends
  `APP_API_PREFIX` (env `API_PREFIX`, **default: empty string** — `onyx/configs/app_configs.py:53`).
- Paths below are the **registered app paths** (i.e., with an empty `API_PREFIX`).
- In a default deployment a reverse proxy serves these under `/api` (FastAPI `servers` entry is
  `{WEB_DOMAIN}/api`); `onyx/server/middleware/api_prefix.py::strip_api_prefix()` strips `/api`
  (or the configured prefix) from incoming requests. So the same endpoint is externally
  `/api/chat/create-chat-session` and internally `/chat/create-chat-session`.
- Auth is enforced app-wide by `check_router_auth(application)` (`onyx/server/auth_check.py`):
  every route is authenticated unless explicitly marked public. `tags=PUBLIC_API_TAGS` rows
  ("api-key public API") are reachable with an API key. `/admin/...` paths are admin-scoped.

## Summary

- **Total routes served by the Standard app: 607 unconditional**
  plus **25 conditional** (env/config-gated) = **632 registered when all gates are on**.
- AST-extracted decorator routes on included routers: **608**
  (590 unconditional + 18 conditional)
- Library-generated (fastapi-users 15.0.4) routes: **16** unconditional
  + **4** conditional (Google OAuth, `OAUTH_ENABLED=true`).
- Special routes: `GET /metrics` (Prometheus instrumentator) + 3 docs routes
  (`/openapi.json`, `/docs`, `/redoc` — only when `ENABLE_PUBLIC_DOCS=true`).

Method histogram (decorator routes):

| Method | Count |
|---|---|
| GET | 248 |
| POST | 191 |
| PUT | 45 |
| PATCH | 58 |
| DELETE | 58 |
| HEAD | 1 |
| OPTIONS | 4 |
| WEBSOCKET | 3 |

### Routers included by `onyx/main.py`

(Groups marked `—` in the prefix column have sub-prefixes per route; see route tables.)

| # | Router (label) | Prefix(es) | Source file(s) | Notes |
|---|---|---|---|---|
| 1 | Password management | `/password` | backend/onyx/server/features/password/api.py | 2 routes.  |
| 2 | Chat (user) | `/chat` | backend/onyx/server/query_and_chat/chat_backend.py | 32 routes.  |
| 3 | Query | `/query`, `/admin` | backend/onyx/server/query_and_chat/query_backend.py | 2 routes.  |
| 4 | Documents | `/document` | backend/onyx/server/documents/document.py | 2 routes.  |
| 5 | Users | — | backend/onyx/server/manage/users.py | 37 routes.  |
| 6 | OAuth test (admin) | `/admin/oauth-test` | backend/onyx/server/manage/oauth_test.py | 1 routes.  |
| 7 | Administrative (manage) | `/manage` | backend/onyx/server/manage/administrative.py | 6 routes.  |
| 8 | OpenSearch health | `/manage/admin/opensearch-health` | backend/onyx/server/manage/opensearch_health/api.py | 2 routes.  |
| 9 | Connectors | `/manage` | backend/onyx/server/documents/connector.py | 27 routes.  |
| 10 | Credentials | `/manage` | backend/onyx/server/documents/credential.py | 14 routes.  |
| 11 | Credential capabilities / connector checks | `/manage` | backend/onyx/server/documents/credential_capabilities.py | 9 routes.  |
| 12 | Input prompts | `/input_prompt`, `/admin/input_prompt` | backend/onyx/server/features/input_prompt/api.py | 7 routes.  |
| 13 | CC-Pair (connector-credential pair) | `/manage` | backend/onyx/server/documents/cc_pair.py | 22 routes.  |
| 14 | Index monitoring | `/manage/admin/index-monitoring` | backend/onyx/server/documents/index_monitoring.py | 5 routes.  |
| 15 | Connector edit | `/manage` | backend/onyx/server/documents/connector_edit.py | 5 routes.  |
| 16 | Targeted reindex | `/manage` | backend/onyx/server/documents/targeted_reindex.py | 2 routes.  |
| 17 | Projects (user) | `/user/projects` | backend/onyx/server/features/projects/api.py | 20 routes.  |
| 18 | Craft webapp proxy (public) | `/build` | backend/onyx/server/features/build/webapp_proxy.py | 3 routes.  |
| 19 | MicroVM (Firecracker sandbox) [conditional] | — | backend/onyx/server/features/microvm/api.py | 3 routes. SANDBOX_RUNTIME == SandboxRuntime.FIRECRACKER |
| 20 | Craft static preview (public) | `/build/static-preview` | backend/onyx/server/features/build/static_preview.py | 1 routes.  |
| 21 | Onyx Craft (build) | `/build`, `/build/admin`, `/sessions`, `/sessions`, `/user-library`, `/scheduled-tasks`, `/approvals`, `/action-policies` | backend/onyx/server/features/build/action_policies.py, backend/onyx/server/features/build/api.py, backend/onyx/server/features/build/approvals/api.py, backend/onyx/server/features/build/debug.py, backend/onyx/server/features/build/external_apps/api.py, backend/onyx/server/features/build/interactive_turns/api.py, backend/onyx/server/features/build/scheduled_tasks/api.py, backend/onyx/server/features/build/session/api.py, backend/onyx/server/features/build/session/messages.py, backend/onyx/server/features/build/static_preview.py, backend/onyx/server/features/build/user_library/api.py | 62 routes.  |
| 22 | Image generation (user) | `/image-generation` | backend/onyx/server/features/image_generation/api.py | 1 routes.  |
| 23 | Document sets | `/manage` | backend/onyx/server/features/document_set/api.py | 6 routes.  |
| 24 | Hierarchy nodes | `/hierarchy-nodes` | backend/onyx/server/features/hierarchy/api.py | 3 routes.  |
| 25 | Search API | `/search` | backend/onyx/server/features/search/api.py | 2 routes.  |
| 26 | Search settings | `/search-settings` | backend/onyx/server/manage/search_settings.py | 16 routes.  |
| 27 | Slack bot management | `/manage` | backend/onyx/server/manage/slack_bot.py | 10 routes.  |
| 28 | Discord bot management | `/manage/admin/discord-bot` | backend/onyx/server/manage/discord_bot/api.py | 11 routes.  |
| 29 | Assistants (persona) | `/persona`, `/admin/persona` | backend/onyx/server/features/persona/api.py | 19 routes.  |
| 30 | Agents | `/agents`, `/admin/agents` | backend/onyx/server/features/persona/api.py | 3 routes.  |
| 31 | Default assistant | `/admin/default-assistant` | backend/onyx/server/features/default_assistant/api.py | 3 routes.  |
| 32 | Notifications | `/notifications` | backend/onyx/server/features/notifications/api.py | 4 routes.  |
| 33 | Banner (admin) | `/admin/banner` | backend/onyx/server/features/admin_banner/api.py | 3 routes.  |
| 34 | Tools | `/tool`, `/admin/tool` | backend/onyx/server/features/tool/api.py | 8 routes.  |
| 35 | State / health | — | backend/onyx/server/manage/get_state.py | 5 routes.  |
| 36 | Onyx API (ingestion, API-key) | `/onyx-api` | backend/onyx/server/onyx_api/ingestion.py | 4 routes.  |
| 37 | Settings | `/settings`, `/admin/settings` | backend/onyx/server/settings/api.py | 2 routes.  |
| 38 | Security keys (admin) | `/admin/security` | backend/onyx/server/security/api.py | 3 routes.  |
| 39 | SSO providers (admin) | `/admin/sso` | backend/onyx/server/manage/sso/api.py | 9 routes.  |
| 40 | LLM (admin) | `/admin/llm` | backend/onyx/server/manage/llm/api.py | 38 routes.  |
| 41 | Knowledge graph (admin) | `/admin/kg` | backend/onyx/server/kg/api.py | 6 routes.  |
| 42 | LLM (user) | `/llm` | backend/onyx/server/manage/llm/api.py | 3 routes.  |
| 43 | Code interpreter (admin) | `/admin/code-interpreter` | backend/onyx/server/manage/code_interpreter/api.py | 3 routes.  |
| 44 | Image generation (admin) | `/admin/image-generation` | backend/onyx/server/manage/image_generation/api.py | 10 routes.  |
| 45 | Embedding (admin) | `/admin/embedding` | backend/onyx/server/manage/embedding/api.py | 6 routes.  |
| 46 | Web search (user) | `/web-search` | backend/onyx/server/features/web_search/api.py | 3 routes.  |
| 47 | Web search providers (admin) | `/admin/web-search` | backend/onyx/server/manage/web_search/api.py | 13 routes.  |
| 48 | Tracing (admin) | `/admin/tracing` | backend/onyx/server/manage/tracing/api.py | 5 routes.  |
| 49 | Voice (admin) | `/admin/voice` | backend/onyx/server/manage/voice/api.py | 10 routes.  |
| 50 | Voice (user) | `/voice` | backend/onyx/server/manage/voice/user_api.py | 5 routes.  |
| 51 | Voice websocket | `/voice` | backend/onyx/server/manage/voice/websocket_api.py | 2 routes.  |
| 52 | Cost overrides (admin) | `/admin/cost-overrides` | backend/onyx/server/features/usage/api.py | 4 routes.  |
| 53 | Usage (user) | `/user/usage` | backend/onyx/server/features/usage/api.py | 1 routes.  |
| 54 | Usage (admin) | `/admin/usage` | backend/onyx/server/features/usage/api.py | 3 routes.  |
| 55 | API keys (admin) | `/admin/api-key` | backend/onyx/server/api_key/api.py | 6 routes.  |
| 56 | Connector OAuth (standard) | `/connector/oauth` | backend/onyx/server/documents/standard_oauth.py | 3 routes.  |
| 57 | Federated connectors | `/federated` | backend/onyx/server/federated/api.py | 15 routes.  |
| 58 | MCP | `/mcp`, `/admin/mcp` | backend/onyx/server/features/mcp/api.py, backend/onyx/server/features/mcp/client_metadata.py | 7 routes.  |
| 59 | Integrations | `/integrations`, `/integrations` | backend/onyx/server/features/integrations/api.py, backend/onyx/server/features/integrations/connections_api.py | 12 routes.  |
| 60 | Integrations (admin) | `/admin/integrations` | backend/onyx/server/features/integrations/admin_api.py | 13 routes.  |
| 61 | Action policies (integrations) | `/action-policies` | backend/onyx/server/features/integrations/api.py | 2 routes.  |
| 62 | Mobile plugins | `/plugins` | backend/onyx/server/features/integrations/api.py | 1 routes.  |
| 63 | Skills | `/skills` | backend/onyx/server/features/skill/api.py | 31 routes.  |
| 64 | Personal access tokens | `/user/pats` | backend/onyx/server/pat/api.py | 4 routes.  |
| 65 | Captcha | `/auth/captcha` | backend/onyx/server/auth/captcha_api.py | 1 routes.  |
| 66 | OAuth provider (protocol) [conditional] | `/oauth-provider` | backend/onyx/server/oauth_provider/protocol.py | 10 routes. OAUTH_PROVIDER_SETTINGS is not None |
| 67 | OAuth provider (user) [conditional] | `/oauth-provider` | backend/onyx/server/oauth_provider/api.py | 5 routes. OAUTH_PROVIDER_SETTINGS is not None |
| 68 | SAML multi-provider | `/auth/saml` | backend/onyx/server/saml_multi.py | 5 routes.  |
| 69 | OIDC multi-provider | `/auth/oidc` | backend/onyx/server/oidc_multi.py | 3 routes.  |
| 70 | SSO discovery | `/auth/sso` | backend/onyx/server/sso_discovery.py | 1 routes.  |
| 71 | Mobile SSO exchange | — | backend/onyx/server/auth/mobile.py | 1 routes.  |

Additional routers not in the table above (library-generated / app-level):

- `fastapi_users.get_auth_router(auth_backend)` → prefix `/auth` (generated by fastapi-users 15.0.4)
- `fastapi_users.get_register_router(...)` → `/auth`
- `fastapi_users.get_reset_password_router()` → `/auth`
- `fastapi_users.get_verify_router(...)` → `/auth`
- `fastapi_users.get_users_router(UserRead, UserUpdate)` → `/users`
- `fastapi_users.get_refresh_router(auth_backend)` (Onyx custom override, `onyx/auth/users.py:2154`) → `/auth`
- `mobile_auth_router` (`onyx/server/auth/mobile.py`) → `/auth/mobile` (includes fastapi-users auth+refresh routers for the `mobile-bearer` backend)
- Google OAuth routers (`create_onyx_oauth_router`, `onyx/auth/users.py:3094`) → `/auth/oauth` and `/auth/mobile/oauth` — **[conditional: `OAUTH_ENABLED=true`]**
- `saml_multi_router` (`onyx/server/saml_multi.py`) → `/auth/saml`
- `oidc_multi_router` (`onyx/server/oidc_multi.py`) → `/auth/oidc`
- `sso_discovery_router` (`onyx/server/sso_discovery.py`) → `/auth/sso`
- Prometheus instrumentator `expose()` → `GET /metrics` (`onyx/server/metrics/prometheus_setup.py`, token-guarded by `verify_metrics_token`)
- FastAPI docs routes → `/openapi.json`, `/docs`, `/redoc` — **[conditional: `ENABLE_PUBLIC_DOCS=true`]** (not registered at all otherwise)

### Empty / dynamically-populated routers

- `onyx/server/manage/embedding/api.py::basic_router` (prefix `/embedding`) is included in
  `main.py` but declares **no routes** in the Standard build (all embedding routes are on
  `admin_router`). Include exists for parity; no porting needed beyond the admin routes.
- `onyx/server/oauth_provider/protocol.py::router` registers its 5 endpoints via
  `@router.api_route(...)` multi-method decorators (GET/OPTIONS, POST/OPTIONS etc.) — listed
  in the OAuth provider (protocol) group below.

### Conditional / out-of-scope notes

- **[EE-conditional]** `onyx/main.py` ends with `app = fetch_versioned_implementation("onyx.main", "get_application")`.
  When the EE package is installed, `ee/onyx/main.py::get_application()` wraps this whole CE app
  (`get_application_base`) and **adds** EE-only routers: user groups (`/manage`), analytics
  (`/analytics`), query history, EE query/search/answer routers, EE OAuth, EE cc-pair, evals,
  hooks, LLM gateway, enterprise settings, spending limits, usage export, log export, license,
  billing (non-playground), tenants (multi-tenant only), and SCIM 2.0 (mounted WITHOUT the
  global prefix, at `/scim/v2/...`). Per audit scope those EE routes are **not enumerated** here.
- **[OUT-OF-SCOPE] Lite**: no Lite-specific routers or `IS_LITE`-style guards exist in the
  Standard backend (only a comment in `main.py` mentions lite deployments); nothing is excluded
  on Lite grounds.
- **Not mounted on this app** (separate FastAPI services / non-HTTP, excluded per scope):
  `onyx/webhook_server/` (own app via `create_webhook_app()`),
  `onyx/server/features/build/sandbox/image/sandbox_daemon/server.py` (sandbox-internal app),
  `onyx/model_server/`, background Celery tasks, `onyx/file_store/` (no routes).
- The 3 `WEBSOCKET` routes and 1 `HEAD` route are included below (websockets marked `WEBSOCKET`).

## Route tables

Legend: `def line` = line number of the handler `def` in the source file (decorator is the line above).

### Password management

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/password/change-password` | `change_my_password` | `server/features/password/api.py` | 27 |  |
| POST | `/password/reset_password` | `admin_reset_user_password` | `server/features/password/api.py` | 48 |  |

### Chat (user)

32 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/chat/approvals/{approval_id}/decision` | `decide_approval` | `server/query_and_chat/chat_backend.py` | 1875 | api-key public API |
| PATCH | `/chat/chat-session/{session_id}` | `patch_chat_session` | `server/query_and_chat/chat_backend.py` | 811 |  |
| GET | `/chat/chat-session/{session_id}/pending-messages` | `list_pending_chat_messages` | `server/query_and_chat/chat_backend.py` | 1756 |  |
| POST | `/chat/chat-session/{session_id}/pending-messages` | `submit_pending_chat_message` | `server/query_and_chat/chat_backend.py` | 1715 |  |
| DELETE | `/chat/chat-session/{session_id}/pending-messages/{message_id}` | `withdraw_pending_chat_message` | `server/query_and_chat/chat_backend.py` | 1766 |  |
| POST | `/chat/chat-session/{session_id}/pending-messages/{message_id}/interrupt` | `interrupt_with_pending_chat_message` | `server/query_and_chat/chat_backend.py` | 1787 |  |
| GET | `/chat/chat-session/{session_id}/resume-stream` | `resume_chat_stream` | `server/query_and_chat/chat_backend.py` | 1597 | api-key public API |
| GET | `/chat/chat-session/{session_id}/status` | `get_chat_session_processing_status` | `server/query_and_chat/chat_backend.py` | 1523 | api-key public API |
| POST | `/chat/chat-session/{session_id}/stop-subagents` | `stop_chat_subagents` | `server/query_and_chat/chat_backend.py` | 1840 |  |
| PATCH | `/chat/chat-session/{session_id}/tool-options` | `update_chat_tool_options` | `server/query_and_chat/chat_backend.py` | 1816 |  |
| POST | `/chat/create-chat-message-feedback` | `create_chat_feedback` | `server/query_and_chat/chat_backend.py` | 1274 | get_feedback_rate_limiters() |
| POST | `/chat/create-chat-session` | `create_new_chat_session` | `server/query_and_chat/chat_backend.py` | 661 | api-key public API |
| DELETE | `/chat/delete-all-chat-sessions` | `delete_all_chat_sessions` | `server/query_and_chat/chat_backend.py` | 847 | api-key public API |
| DELETE | `/chat/delete-chat-session/{session_id}` | `delete_chat_session_by_id` | `server/query_and_chat/chat_backend.py` | 892 | api-key public API |
| POST | `/chat/end-incognito-session/{session_id}` | `end_incognito_session` | `server/query_and_chat/chat_backend.py` | 945 | api-key public API |
| GET | `/chat/file/{file_id:path}` | `fetch_chat_file` | `server/query_and_chat/chat_backend.py` | 1374 | api-key public API |
| GET | `/chat/get-chat-session/{session_id}` | `get_chat_session` | `server/query_and_chat/chat_backend.py` | 458 | api-key public API |
| GET | `/chat/get-user-chat-sessions` | `get_user_chat_sessions` | `server/query_and_chat/chat_backend.py` | 303 | api-key public API |
| GET | `/chat/incognito-availability` | `get_incognito_availability` | `server/query_and_chat/chat_backend.py` | 933 |  |
| GET | `/chat/max-selected-document-tokens` | `get_max_document_tokens` | `server/query_and_chat/chat_backend.py` | 1314 |  |
| POST | `/chat/question-requests/{question_request_id}/answers` | `answer_questions` | `server/query_and_chat/chat_backend.py` | 1986 | api-key public API |
| DELETE | `/chat/remove-chat-message-feedback` | `remove_chat_feedback` | `server/query_and_chat/chat_backend.py` | 1295 | get_feedback_rate_limiters() |
| PUT | `/chat/rename-chat-session` | `rename_chat_session` | `server/query_and_chat/chat_backend.py` | 751 |  |
| GET | `/chat/search` | `search_chats` | `server/query_and_chat/chat_backend.py` | 1438 | api-key public API |
| POST | `/chat/seed-chat-session-from-slack` | `seed_chat_from_slack` | `server/query_and_chat/chat_backend.py` | 1350 |  |
| POST | `/chat/send-chat-message` | `handle_send_chat_message` | `server/query_and_chat/chat_backend.py` | 1029 | response_model=ChatFullResponse; api-key public API |
| PUT | `/chat/set-message-as-latest` | `set_message_as_latest` | `server/query_and_chat/chat_backend.py` | 1226 |  |
| PUT | `/chat/set-preferred-response` | `set_preferred_response_endpoint` | `server/query_and_chat/chat_backend.py` | 1247 |  |
| POST | `/chat/stop-chat-session/{chat_session_id}` | `stop_chat_session` | `server/query_and_chat/chat_backend.py` | 2117 | api-key public API |
| PUT | `/chat/update-chat-session-model` | `update_chat_session_model` | `server/query_and_chat/chat_backend.py` | 441 |  |
| PUT | `/chat/update-chat-session-reasoning` | `update_chat_session_reasoning` | `server/query_and_chat/chat_backend.py` | 406 |  |
| PUT | `/chat/update-chat-session-temperature` | `update_chat_session_temperature` | `server/query_and_chat/chat_backend.py` | 366 |  |

### Query

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/admin/search` | `admin_search` | `server/query_and_chat/query_backend.py` | 37 | [Depends(require_vector_db)] |
| GET | `/query/valid-tags` | `get_tags` | `server/query_and_chat/query_backend.py` | 86 |  |

### Documents

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/document/chunk-info` | `get_chunk_info` | `server/documents/document.py` | 78 | [Depends(require_vector_db)] |
| GET | `/document/document-size-info` | `get_document_info` | `server/documents/document.py` | 29 | [Depends(require_vector_db)] |

### Users

37 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| PATCH | `/auto-scroll` | `update_user_auto_scroll_api` | `server/manage/users.py` | 1308 |  |
| PATCH | `/interrupt-on-send` | `update_user_interrupt_on_send_api` | `server/manage/users.py` | 1299 |  |
| PATCH | `/manage/admin/activate-user` | `activate_user_api` | `server/manage/users.py` | 923 | api-key public API |
| PATCH | `/manage/admin/deactivate-user` | `deactivate_user_api` | `server/manage/users.py` | 802 | api-key public API |
| DELETE | `/manage/admin/delete-user` | `delete_user` | `server/manage/users.py` | 842 | api-key public API |
| PATCH | `/manage/admin/remove-invited-user` | `remove_invited_user` | `server/manage/users.py` | 767 | api-key public API |
| POST | `/manage/admin/transfer-private-plugins` | `transfer_private_plugins` | `server/manage/users.py` | 902 | api-key public API |
| PUT | `/manage/admin/users` | `bulk_invite_users` | `server/manage/users.py` | 587 | api-key public API |
| PATCH | `/manage/admin/users/admin-access` | `set_user_admin_access_endpoint` | `server/manage/users.py` | 174 | api-key public API |
| PATCH | `/manage/admin/users/craft-enabled` | `set_user_craft_access` | `server/manage/users.py` | 213 |  |
| GET | `/manage/admin/valid-domains` | `get_valid_domains` | `server/manage/users.py` | 962 |  |
| GET | `/manage/users` | `list_all_users` | `server/manage/users.py` | 452 | api-key public API |
| GET | `/manage/users/accepted` | `list_accepted_users` | `server/manage/users.py` | 279 | api-key public API |
| GET | `/manage/users/accepted/all` | `list_all_accepted_users` | `server/manage/users.py` | 356 | api-key public API |
| GET | `/manage/users/counts` | `get_user_counts` | `server/manage/users.py` | 397 |  |
| GET | `/manage/users/download` | `download_users_csv` | `server/manage/users.py` | 548 |  |
| GET | `/manage/users/invited` | `list_invited_users` | `server/manage/users.py` | 405 | api-key public API |
| POST | `/manage/users/test-upsert-user` | `test_upsert_user` | `server/manage/users.py` | 257 |  |
| GET | `/me` | `verify_user_logged_in` | `server/manage/users.py` | 1108 | api-key public API; [Depends(scope_exempt)] |
| GET | `/me/permissions` | `get_current_user_permissions` | `server/manage/users.py` | 1096 | api-key public API |
| PATCH | `/paste-as-tile` | `update_user_paste_as_tile_api` | `server/manage/users.py` | 1290 |  |
| PATCH | `/reasoning-effort-default` | `update_user_reasoning_effort_default_api` | `server/manage/users.py` | 1255 |  |
| PATCH | `/shortcut-enabled` | `update_user_shortcut_enabled_api` | `server/manage/users.py` | 1281 |  |
| PATCH | `/temperature-default` | `update_user_temperature_default_api` | `server/manage/users.py` | 1227 |  |
| PATCH | `/temperature-override-enabled` | `update_user_temperature_override_enabled_api` | `server/manage/users.py` | 1266 |  |
| PATCH | `/user/assistant-list/update/{assistant_id}` | `update_user_assistant_visibility_api` | `server/manage/users.py` | 1480 |  |
| GET | `/user/assistant/preferences` | `get_user_assistant_preferences` | `server/manage/users.py` | 1502 |  |
| PATCH | `/user/assistant/{assistant_id}/preferences` | `update_assistant_preferences_for_user_api` | `server/manage/users.py` | 1520 |  |
| PATCH | `/user/chat-background` | `update_user_chat_background_api` | `server/manage/users.py` | 1367 |  |
| PATCH | `/user/default-app-mode` | `update_user_default_app_mode_api` | `server/manage/users.py` | 1376 |  |
| PATCH | `/user/default-model` | `update_user_default_model_api` | `server/manage/users.py` | 1385 |  |
| GET | `/user/files/recent` | `get_recent_files` | `server/manage/users.py` | 1533 |  |
| PATCH | `/user/language` | `update_user_language_api` | `server/manage/users.py` | 1355 |  |
| PATCH | `/user/personalization` | `update_user_personalization_api` | `server/manage/users.py` | 1394 |  |
| PATCH | `/user/pinned-assistants` | `set_pinned_personas_api` | `server/manage/users.py` | 1442 |  |
| PATCH | `/user/theme-preference` | `update_user_theme_preference_api` | `server/manage/users.py` | 1317 |  |
| GET | `/users` | `list_all_users_basic_info` | `server/manage/users.py` | 972 | api-key public API |

### OAuth test (admin)

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/oauth-test/claims` | `get_oauth_login_claims` | `server/manage/oauth_test.py` | 48 |  |

### Administrative (manage)

6 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/manage/admin/deletion-attempt` | `create_deletion_attempt_for_connector_id` | `server/manage/administrative.py` | 152 | api-key public API |
| GET | `/manage/admin/doc-boosts` | `get_most_boosted_docs` | `server/manage/administrative.py` | 64 |  |
| POST | `/manage/admin/doc-boosts` | `document_boost_update` | `server/manage/administrative.py` | 90 |  |
| POST | `/manage/admin/doc-hidden` | `document_hidden_update` | `server/manage/administrative.py` | 105 |  |
| GET | `/manage/admin/genai-api-key/validate` | `validate_existing_genai_api_key` | `server/manage/administrative.py` | 120 |  |
| GET | `/manage/admin/indexing/failed-documents` | `get_failed_documents` | `server/manage/administrative.py` | 218 |  |

### OpenSearch health

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/manage/admin/opensearch-health` | `read_resource_health` | `server/manage/opensearch_health/api.py` | 17 |  |
| POST | `/manage/admin/opensearch-health/popup` | `claim_resource_popup` | `server/manage/opensearch_health/api.py` | 24 |  |

### Connectors

27 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/manage/admin/connector` | `get_connectors_by_credential` | `server/documents/connector.py` | 963 | api-key public API |
| POST | `/manage/admin/connector` | `create_connector_from_model` | `server/documents/connector.py` | 1662 | api-key public API |
| POST | `/manage/admin/connector-with-credential` | `create_connector_with_credential` | `server/documents/connector.py` | 1826 |  |
| POST | `/manage/admin/connector-with-mock-credential` | `create_connector_with_mock_credential` | `server/documents/connector.py` | 1703 |  |
| GET | `/manage/admin/connector/event-sources` | `get_event_sources` | `server/documents/connector.py` | 2556 |  |
| GET | `/manage/admin/connector/failed-indexing-status` | `get_currently_failed_indexing_status` | `server/documents/connector.py` | 996 | api-key public API |
| POST | `/manage/admin/connector/file/upload` | `upload_files_api` | `server/documents/connector.py` | 579 | api-key public API |
| PUT | `/manage/admin/connector/gmail/service-account-credential` | `upsert_gmail_service_account_credential` | `server/documents/connector.py` | 270 |  |
| GET | `/manage/admin/connector/google-drive/check-auth/{credential_id}` | `check_drive_tokens` | `server/documents/connector.py` | 302 |  |
| PUT | `/manage/admin/connector/google-drive/service-account-credential` | `upsert_service_account_credential` | `server/documents/connector.py` | 250 |  |
| POST | `/manage/admin/connector/indexing-status` | `get_connector_indexing_status` | `server/documents/connector.py` | 1152 | api-key public API |
| POST | `/manage/admin/connector/run-once` | `connector_run_once` | `server/documents/connector.py` | 2101 | api-key public API |
| GET | `/manage/admin/connector/status` | `get_connector_status` | `server/documents/connector.py` | 1086 | api-key public API |
| DELETE | `/manage/admin/connector/{connector_id}` | `delete_connector_by_id` | `server/documents/connector.py` | 2073 | api-key public API |
| PATCH | `/manage/admin/connector/{connector_id}` | `update_connector_from_model` | `server/documents/connector.py` | 2012 | api-key public API |
| GET | `/manage/admin/connector/{connector_id}/files` | `list_connector_files` | `server/documents/connector.py` | 592 | api-key public API |
| POST | `/manage/admin/connector/{connector_id}/files/update` | `update_connector_files` | `server/documents/connector.py` | 731 | api-key public API |
| GET | `/manage/connector` | `get_connectors` | `server/documents/connector.py` | 2289 | api-key public API |
| GET | `/manage/connector-group-restrictions` | `get_connector_group_restrictions_status` | `server/documents/connector.py` | 289 |  |
| POST | `/manage/connector-request` | `submit_connector_request` | `server/documents/connector.py` | 2347 |  |
| GET | `/manage/connector-status` | `get_basic_connector_indexing_status` | `server/documents/connector.py` | 2434 | api-key public API |
| GET | `/manage/connector/gmail/authorize/{credential_id}` | `gmail_auth` | `server/documents/connector.py` | 2183 |  |
| GET | `/manage/connector/gmail/callback` | `gmail_callback` | `server/documents/connector.py` | 2229 |  |
| GET | `/manage/connector/google-drive/authorize/{credential_id}` | `google_drive_auth` | `server/documents/connector.py` | 2206 |  |
| GET | `/manage/connector/google-drive/callback` | `google_drive_callback` | `server/documents/connector.py` | 2259 |  |
| GET | `/manage/connector/{connector_id}` | `get_connector_by_id` | `server/documents/connector.py` | 2317 | api-key public API |
| GET | `/manage/indexed-sources` | `get_indexed_sources` | `server/documents/connector.py` | 2304 | api-key public API |

### Credentials

14 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/manage/admin/credential` | `list_credentials_admin` | `server/documents/credential.py` | 132 |  |
| PUT | `/manage/admin/credential/private-key/{credential_id}` | `update_credential_private_key` | `server/documents/credential.py` | 489 |  |
| PUT | `/manage/admin/credential/swap` | `swap_credentials_for_connector` | `server/documents/credential.py` | 235 |  |
| DELETE | `/manage/admin/credential/{credential_id}` | `delete_credential_by_id_admin` | `server/documents/credential.py` | 215 |  |
| PUT | `/manage/admin/credential/{credential_id}` | `update_credential_data` | `server/documents/credential.py` | 464 |  |
| PUT | `/manage/admin/credential/{credential_id}/sharing` | `update_credential_sharing_endpoint` | `server/documents/credential.py` | 536 |  |
| GET | `/manage/admin/similar-credentials/{source_type}` | `get_cc_source_full_info` | `server/documents/credential.py` | 147 |  |
| GET | `/manage/credential` | `list_credentials` | `server/documents/credential.py` | 435 |  |
| POST | `/manage/credential` | `create_credential_from_model` | `server/documents/credential.py` | 335 |  |
| DELETE | `/manage/credential/force/{credential_id}` | `force_delete_credential_by_id` | `server/documents/credential.py` | 646 |  |
| POST | `/manage/credential/private-key` | `create_credential_with_private_key` | `server/documents/credential.py` | 370 |  |
| DELETE | `/manage/credential/{credential_id}` | `delete_credential_by_id` | `server/documents/credential.py` | 621 |  |
| GET | `/manage/credential/{credential_id}` | `get_credential_by_id` | `server/documents/credential.py` | 444 |  |
| PATCH | `/manage/credential/{credential_id}` | `update_credential_from_model` | `server/documents/credential.py` | 593 |  |

### Credential capabilities / connector checks

9 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/manage/admin/connector-checks/plan` | `plan_draft_checks` | `server/documents/credential_capabilities.py` | 580 |  |
| POST | `/manage/admin/connector-checks/runs` | `start_draft_check_run` | `server/documents/credential_capabilities.py` | 637 |  |
| GET | `/manage/admin/connector-checks/runs/{run_id}` | `get_draft_check_run` | `server/documents/credential_capabilities.py` | 701 |  |
| POST | `/manage/admin/connector-checks/runs/{run_id}/cancel` | `cancel_draft_check_run` | `server/documents/credential_capabilities.py` | 685 |  |
| GET | `/manage/admin/credential/capability-reports` | `list_capability_reports_for_source` | `server/documents/credential_capabilities.py` | 364 |  |
| POST | `/manage/admin/credential/{credential_id}/binding-check` | `check_credential_binding` | `server/documents/credential_capabilities.py` | 454 |  |
| POST | `/manage/admin/credential/{credential_id}/capability-check` | `trigger_capability_check` | `server/documents/credential_capabilities.py` | 215 |  |
| GET | `/manage/admin/credential/{credential_id}/capability-report` | `get_capability_report` | `server/documents/credential_capabilities.py` | 319 |  |
| POST | `/manage/admin/draft-credential/binding-check` | `check_draft_credential_binding` | `server/documents/credential_capabilities.py` | 494 |  |

### Input prompts

7 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| DELETE | `/admin/input_prompt/{input_prompt_id}` | `delete_public_input_prompt` | `server/features/input_prompt/api.py` | 125 |  |
| GET | `/input_prompt` | `list_input_prompts` | `server/features/input_prompt/api.py` | 34 |  |
| POST | `/input_prompt` | `create_input_prompt` | `server/features/input_prompt/api.py` | 63 |  |
| DELETE | `/input_prompt/{input_prompt_id}` | `delete_input_prompt` | `server/features/input_prompt/api.py` | 107 |  |
| GET | `/input_prompt/{input_prompt_id}` | `get_input_prompt` | `server/features/input_prompt/api.py` | 48 |  |
| PATCH | `/input_prompt/{input_prompt_id}` | `patch_input_prompt` | `server/features/input_prompt/api.py` | 83 |  |
| POST | `/input_prompt/{input_prompt_id}/hide` | `hide_input_prompt_for_user` | `server/features/input_prompt/api.py` | 140 |  |

### CC-Pair (connector-credential pair)

22 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/manage/admin/cc-pair/{cc_pair_id}` | `get_cc_pair_full_info` | `server/documents/cc_pair.py` | 675 | api-key public API |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/document-types` | `get_cc_pair_document_types` | `server/documents/cc_pair.py` | 1277 |  |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/errors` | `get_cc_pair_indexing_errors` | `server/documents/cc_pair.py` | 1216 | api-key public API |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/errors/resolve` | `resolve_cc_pair_indexing_errors` | `server/documents/cc_pair.py` | 1301 |  |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/get-docs-sync-status` | `get_docs_sync_status` | `server/documents/cc_pair.py` | 1199 |  |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/hierarchy-breakdown` | `get_cc_pair_hierarchy_breakdown` | `server/documents/cc_pair.py` | 812 |  |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/index-attempts` | `get_cc_pair_index_attempts` | `server/documents/cc_pair.py` | 212 | api-key public API |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/last_pruned` | `get_cc_pair_last_pruned` | `server/documents/cc_pair.py` | 1123 |  |
| PUT | `/manage/admin/cc-pair/{cc_pair_id}/name` | `update_cc_pair_name` | `server/documents/cc_pair.py` | 966 |  |
| PUT | `/manage/admin/cc-pair/{cc_pair_id}/property` | `update_cc_pair_property` | `server/documents/cc_pair.py` | 1000 |  |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/prune` | `prune_cc_pair` | `server/documents/cc_pair.py` | 1135 | api-key public API |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/release-indexing-hold` | `release_indexing_hold` | `server/documents/cc_pair.py` | 1071 |  |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/runs` | `get_cc_pair_runs` | `server/documents/cc_pair.py` | 332 |  |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/runs/resolvable-count` | `get_resolvable_cc_pair_runs_count` | `server/documents/cc_pair.py` | 467 |  |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/runs/resolve` | `resolve_cc_pair_runs` | `server/documents/cc_pair.py` | 391 |  |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/runs/resolve-matching` | `resolve_matching_cc_pair_runs` | `server/documents/cc_pair.py` | 497 |  |
| PUT | `/manage/admin/cc-pair/{cc_pair_id}/status` | `update_cc_pair_status` | `server/documents/cc_pair.py` | 827 | api-key public API |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/throughput` | `get_cc_pair_throughput` | `server/documents/cc_pair.py` | 525 |  |
| POST | `/manage/admin/index-attempt/{index_attempt_id}/cancel` | `cancel_index_attempt` | `server/documents/cc_pair.py` | 614 |  |
| GET | `/manage/admin/index-attempt/{index_attempt_id}/stage-metrics` | `get_index_attempt_stage_metrics` | `server/documents/cc_pair.py` | 256 |  |
| DELETE | `/manage/connector/{connector_id}/credential/{credential_id}` | `dissociate_credential_from_connector` | `server/documents/cc_pair.py` | 1512 | api-key public API |
| PUT | `/manage/connector/{connector_id}/credential/{credential_id}` | `associate_credential_to_connector` | `server/documents/cc_pair.py` | 1360 | api-key public API |

### Index monitoring

5 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/manage/admin/index-monitoring/connectors` | `get_indexing_connectors` | `server/documents/index_monitoring.py` | 336 |  |
| GET | `/manage/admin/index-monitoring/overview` | `get_indexing_overview` | `server/documents/index_monitoring.py` | 204 |  |
| GET | `/manage/admin/index-monitoring/runs` | `get_indexing_runs` | `server/documents/index_monitoring.py` | 626 |  |
| GET | `/manage/admin/index-monitoring/runs/resolvable-count` | `get_resolvable_indexing_runs_count` | `server/documents/index_monitoring.py` | 560 |  |
| POST | `/manage/admin/index-monitoring/runs/resolve` | `resolve_indexing_runs` | `server/documents/index_monitoring.py` | 595 |  |

### Connector edit

5 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/manage/admin/cc-pair/{cc_pair_id}/edit/apply` | `apply_cc_pair_edit` | `server/documents/connector_edit.py` | 273 |  |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/edit/checks` | `start_cc_pair_edit_checks` | `server/documents/connector_edit.py` | 321 |  |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/edit/files` | `stage_cc_pair_edit_files` | `server/documents/connector_edit.py` | 358 |  |
| POST | `/manage/admin/cc-pair/{cc_pair_id}/edit/plan` | `plan_cc_pair_edit` | `server/documents/connector_edit.py` | 231 |  |
| GET | `/manage/admin/cc-pair/{cc_pair_id}/edit/plan/{plan_id}` | `get_cc_pair_edit_plan` | `server/documents/connector_edit.py` | 255 |  |

### Targeted reindex

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/manage/admin/indexing/targeted-reindex` | `submit_targeted_reindex` | `server/documents/targeted_reindex.py` | 87 |  |
| GET | `/manage/admin/indexing/targeted-reindex/{job_id}` | `get_targeted_reindex_status` | `server/documents/targeted_reindex.py` | 188 |  |

### Projects (user)

20 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/user/projects` | `get_projects` | `server/features/projects/api.py` | 162 | api-key public API |
| POST | `/user/projects/create` | `create_project` | `server/features/projects/api.py` | 172 | api-key public API |
| POST | `/user/projects/file/statuses` | `get_user_file_statuses` | `server/features/projects/api.py` | 560 | api-key public API |
| POST | `/user/projects/file/upload` | `upload_user_files` | `server/features/projects/api.py` | 187 | api-key public API |
| DELETE | `/user/projects/file/{file_id}` | `delete_user_file` | `server/features/projects/api.py` | 481 | api-key public API |
| GET | `/user/projects/file/{file_id}` | `get_user_file` | `server/features/projects/api.py` | 539 | api-key public API |
| GET | `/user/projects/files/{project_id}` | `get_files_in_project` | `server/features/projects/api.py` | 263 | api-key public API |
| POST | `/user/projects/remove_chat_session` | `remove_chat_session` | `server/features/projects/api.py` | 599 |  |
| GET | `/user/projects/session/{chat_session_id}/files` | `get_chat_session_project_files` | `server/features/projects/api.py` | 638 | api-key public API |
| GET | `/user/projects/session/{chat_session_id}/token-count` | `get_chat_session_project_token_count` | `server/features/projects/api.py` | 614 |  |
| DELETE | `/user/projects/{project_id}` | `delete_project` | `server/features/projects/api.py` | 457 | api-key public API |
| GET | `/user/projects/{project_id}` | `get_project` | `server/features/projects/api.py` | 250 | api-key public API |
| PATCH | `/user/projects/{project_id}` | `update_project` | `server/features/projects/api.py` | 433 | api-key public API |
| GET | `/user/projects/{project_id}/details` | `get_project_details` | `server/features/projects/api.py` | 404 | api-key public API |
| DELETE | `/user/projects/{project_id}/files/{file_id}` | `unlink_user_file_from_project` | `server/features/projects/api.py` | 280 | api-key public API |
| POST | `/user/projects/{project_id}/files/{file_id}` | `link_user_file_to_project` | `server/features/projects/api.py` | 316 | api-key public API |
| GET | `/user/projects/{project_id}/instructions` | `get_project_instructions` | `server/features/projects/api.py` | 356 | api-key public API |
| POST | `/user/projects/{project_id}/instructions` | `upsert_project_instructions` | `server/features/projects/api.py` | 378 | api-key public API |
| POST | `/user/projects/{project_id}/move_chat_session` | `move_chat_session` | `server/features/projects/api.py` | 581 |  |
| GET | `/user/projects/{project_id}/token-count` | `get_project_total_token_count` | `server/features/projects/api.py` | 665 |  |

### Craft webapp proxy (public)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/build/sessions/{session_id}/webapp` | `get_webapp` | `server/features/build/webapp_proxy.py` | 375 | response_model=None |
| WEBSOCKET | `/build/sessions/{session_id}/webapp/_next/{hmr_endpoint}` | `websocket_webapp_hmr` | `server/features/build/webapp_proxy.py` | 406 |  |
| GET | `/build/sessions/{session_id}/webapp/{path:path}` | `get_webapp` | `server/features/build/webapp_proxy.py` | 375 | response_model=None |

### MicroVM (Firecracker sandbox) [conditional]

3 routes — **[conditional: SANDBOX_RUNTIME == SandboxRuntime.FIRECRACKER]**.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/microvm/node/deregister` | `deregister_sandbox_node` | `server/features/microvm/api.py` | 276 |  |
| PUT | `/microvm/node/signing-key` | `register_sandbox_node_signing_key` | `server/features/microvm/api.py` | 108 |  |
| POST | `/microvm/node/state` | `report_sandbox_node_state` | `server/features/microvm/api.py` | 213 |  |

### Craft static preview (public)

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/build/static-preview/{token}/{path:path}` | `read_static_preview` | `server/features/build/static_preview.py` | 143 |  |

### Onyx Craft (build)

62 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/build/action-policies` | `list_personal_action_policies` | `server/features/build/action_policies.py` | 17 |  |
| GET | `/build/admin/base-instructions` | `get_base_instructions` | `server/features/build/api.py` | 54 |  |
| GET | `/build/approvals/sessions/{session_id}` | `list_session_approvals` | `server/features/build/approvals/api.py` | 132 |  |
| GET | `/build/approvals/sessions/{session_id}/live` | `list_live_approvals` | `server/features/build/approvals/api.py` | 176 |  |
| GET | `/build/approvals/sessions/{session_id}/status` | `list_session_approval_status` | `server/features/build/approvals/api.py` | 153 |  |
| POST | `/build/approvals/{approval_id}/decision` | `submit_decision` | `server/features/build/approvals/api.py` | 200 |  |
| POST | `/build/apps/connect/{request_id}/decision` | `resolve_connect_app_request` | `server/features/build/external_apps/api.py` | 29 |  |
| GET | `/build/debug/opencode-logs/stream` | `stream_opencode_logs` | `server/features/build/debug.py` | 43 |  |
| GET | `/build/scheduled-tasks` | `list_scheduled_tasks` | `server/features/build/scheduled_tasks/api.py` | 384 |  |
| POST | `/build/scheduled-tasks` | `create_task` | `server/features/build/scheduled_tasks/api.py` | 409 |  |
| GET | `/build/scheduled-tasks/unviewed-count` | `get_unviewed_task_count` | `server/features/build/scheduled_tasks/api.py` | 399 |  |
| DELETE | `/build/scheduled-tasks/{task_id}` | `delete_task` | `server/features/build/scheduled_tasks/api.py` | 502 |  |
| GET | `/build/scheduled-tasks/{task_id}` | `get_task` | `server/features/build/scheduled_tasks/api.py` | 455 |  |
| PATCH | `/build/scheduled-tasks/{task_id}` | `patch_task` | `server/features/build/scheduled_tasks/api.py` | 466 |  |
| GET | `/build/scheduled-tasks/{task_id}/action-policies` | `list_task_action_policies` | `server/features/build/scheduled_tasks/api.py` | 625 |  |
| POST | `/build/scheduled-tasks/{task_id}/run-now` | `run_now` | `server/features/build/scheduled_tasks/api.py` | 516 |  |
| GET | `/build/scheduled-tasks/{task_id}/runs` | `list_task_runs` | `server/features/build/scheduled_tasks/api.py` | 539 |  |
| PATCH | `/build/scheduled-tasks/{task_id}/runs/viewed` | `view_task_runs` | `server/features/build/scheduled_tasks/api.py` | 578 |  |
| PATCH | `/build/scheduled-tasks/{task_id}/runs/{run_id}/viewed` | `view_task_run` | `server/features/build/scheduled_tasks/api.py` | 601 |  |
| GET | `/build/sessions` | `list_sessions` | `server/features/build/session/api.py` | 101 |  |
| POST | `/build/sessions` | `create_session` | `server/features/build/session/api.py` | 119 |  |
| DELETE | `/build/sessions/{session_id}` | `delete_session` | `server/features/build/session/api.py` | 337 | response_model=None |
| GET | `/build/sessions/{session_id}` | `get_session_details` | `server/features/build/session/api.py` | 178 |  |
| GET | `/build/sessions/{session_id}/artifacts` | `list_artifacts` | `server/features/build/session/api.py` | 516 | response_model=list[ArtifactResponse] |
| GET | `/build/sessions/{session_id}/artifacts/{path:path}` | `download_artifact` | `server/features/build/session/api.py` | 645 |  |
| GET | `/build/sessions/{session_id}/download-directory/{path:path}` | `download_directory` | `server/features/build/session/api.py` | 828 |  |
| GET | `/build/sessions/{session_id}/export-docx/{path:path}` | `export_docx` | `server/features/build/session/api.py` | 683 |  |
| GET | `/build/sessions/{session_id}/files` | `list_directory` | `server/features/build/session/api.py` | 607 |  |
| DELETE | `/build/sessions/{session_id}/files/{path:path}` | `delete_file_endpoint` | `server/features/build/session/api.py` | 917 | response_model=None |
| POST | `/build/sessions/{session_id}/generate-name` | `generate_session_name` | `server/features/build/session/api.py` | 281 |  |
| POST | `/build/sessions/{session_id}/interrupt` | `interrupt_message` | `server/features/build/session/messages.py` | 296 | api-key public API |
| GET | `/build/sessions/{session_id}/messages` | `list_messages` | `server/features/build/session/messages.py` | 65 | api-key public API |
| PUT | `/build/sessions/{session_id}/name` | `update_session_name` | `server/features/build/session/api.py` | 298 |  |
| POST | `/build/sessions/{session_id}/opencode-history-snapshot` | `create_session_opencode_history_snapshot` | `server/features/build/session/api.py` | 482 |  |
| GET | `/build/sessions/{session_id}/output-cards` | `get_output_cards` | `server/features/build/session/api.py` | 533 |  |
| PATCH | `/build/sessions/{session_id}/output-cards/viewed` | `view_output_cards` | `server/features/build/session/api.py` | 549 |  |
| PATCH | `/build/sessions/{session_id}/output-cards/{artifact_id}/viewed` | `view_output_card` | `server/features/build/session/api.py` | 571 |  |
| GET | `/build/sessions/{session_id}/output-thumbnail/{path:path}` | `get_output_thumbnail` | `server/features/build/session/api.py` | 745 |  |
| GET | `/build/sessions/{session_id}/outputs` | `get_output_inventory` | `server/features/build/session/api.py` | 597 |  |
| GET | `/build/sessions/{session_id}/pptx-preview/{path:path}` | `get_pptx_preview` | `server/features/build/session/api.py` | 718 |  |
| GET | `/build/sessions/{session_id}/pre-provisioned-check` | `check_pre_provisioned_session` | `server/features/build/session/api.py` | 250 |  |
| PATCH | `/build/sessions/{session_id}/public` | `set_session_public` | `server/features/build/session/api.py` | 318 |  |
| POST | `/build/sessions/{session_id}/restore` | `restore_session` | `server/features/build/session/api.py` | 375 |  |
| GET | `/build/sessions/{session_id}/sandbox-status` | `get_sandbox_status` | `server/features/build/session/api.py` | 229 |  |
| GET | `/build/sessions/{session_id}/scheduled-run-context` | `get_session_scheduled_run_context` | `server/features/build/session/api.py` | 972 |  |
| GET | `/build/sessions/{session_id}/scheduled-run-events` | `get_session_scheduled_run_events` | `server/features/build/session/api.py` | 1026 |  |
| POST | `/build/sessions/{session_id}/send-message` | `send_message` | `server/features/build/session/messages.py` | 84 | api-key public API |
| POST | `/build/sessions/{session_id}/skills/reload` | `reload_session_skills` | `server/features/build/session/api.py` | 215 |  |
| POST | `/build/sessions/{session_id}/snapshot` | `create_session_snapshot` | `server/features/build/session/api.py` | 447 |  |
| POST | `/build/sessions/{session_id}/static-preview/{path:path}` | `create_static_preview` | `server/features/build/static_preview.py` | 63 |  |
| POST | `/build/sessions/{session_id}/subagents/{subagent_session_id}/send-message` | `send_subagent_message` | `server/features/build/session/messages.py` | 227 | api-key public API |
| GET | `/build/sessions/{session_id}/turns/active` | `get_active_interactive_turn` | `server/features/build/interactive_turns/api.py` | 101 | api-key public API |
| GET | `/build/sessions/{session_id}/turns/{turn_id}` | `get_interactive_turn` | `server/features/build/interactive_turns/api.py` | 121 | api-key public API |
| GET | `/build/sessions/{session_id}/turns/{turn_id}/events` | `get_interactive_turn_events` | `server/features/build/interactive_turns/api.py` | 140 | api-key public API |
| POST | `/build/sessions/{session_id}/upload` | `upload_file_endpoint` | `server/features/build/session/api.py` | 865 |  |
| GET | `/build/sessions/{session_id}/webapp-download` | `download_webapp` | `server/features/build/session/api.py` | 798 |  |
| GET | `/build/sessions/{session_id}/webapp-info` | `get_webapp_info` | `server/features/build/session/api.py` | 776 |  |
| POST | `/build/user-library/directories` | `create_directory` | `server/features/build/user_library/api.py` | 459 |  |
| DELETE | `/build/user-library/files/{document_id}` | `delete_file` | `server/features/build/user_library/api.py` | 493 |  |
| GET | `/build/user-library/tree` | `get_library_tree` | `server/features/build/user_library/api.py` | 154 |  |
| POST | `/build/user-library/upload` | `upload_files` | `server/features/build/user_library/api.py` | 184 |  |
| POST | `/build/user-library/upload-zip` | `upload_zip` | `server/features/build/user_library/api.py` | 288 |  |

### Image generation (user)

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/image-generation/generate` | `generate_image` | `server/features/image_generation/api.py` | 219 |  |

### Document sets

6 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| PATCH | `/manage/admin/document-set` | `patch_document_set` | `server/features/document_set/api.py` | 117 |  |
| POST | `/manage/admin/document-set` | `create_document_set` | `server/features/document_set/api.py` | 50 |  |
| DELETE | `/manage/admin/document-set/{document_set_id}` | `delete_document_set` | `server/features/document_set/api.py` | 186 |  |
| GET | `/manage/admin/document-set/{document_set_id}` | `get_document_set` | `server/features/document_set/api.py` | 236 |  |
| GET | `/manage/document-set` | `list_document_sets_for_user` | `server/features/document_set/api.py` | 290 |  |
| GET | `/manage/document-set-public` | `document_set_public` | `server/features/document_set/api.py` | 358 |  |

### Hierarchy nodes

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/hierarchy-nodes` | `list_accessible_hierarchy_nodes` | `server/features/hierarchy/api.py` | 44 |  |
| POST | `/hierarchy-nodes/documents` | `list_accessible_hierarchy_node_documents` | `server/features/hierarchy/api.py` | 71 |  |
| GET | `/hierarchy-nodes/search` | `search_hierarchy_nodes` | `server/features/hierarchy/api.py` | 126 |  |

### Search API

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/search` | `search` | `server/features/search/api.py` | 90 | [Depends(require_vector_db), Depends(check_token_rate_limits), Depends(check_api_key_usage)]; api-key public API |
| POST | `/search/raw` | `raw_search` | `server/features/search/api.py` | 193 | [Depends(require_vector_db), Depends(check_api_key_usage)]; api-key public API |

### Search settings

16 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/search-settings/cancel-new-embedding` | `cancel_new_embedding` | `server/manage/search_settings.py` | 733 | [Depends(require_vector_db)] |
| PUT | `/search-settings/cc-pair-access-mode` | `update_cc_pair_access_mode` | `server/manage/search_settings.py` | 1000 |  |
| GET | `/search-settings/cc-pair-ids-backfill-progress` | `get_cc_pair_ids_backfill_status` | `server/manage/search_settings.py` | 949 |  |
| DELETE | `/search-settings/delete-search-settings` | `delete_search_settings_endpoint` | `server/manage/search_settings.py` | 798 |  |
| DELETE | `/search-settings/delete-unstructured-api-key` | `delete_unstructured_api_key_endpoint` | `server/manage/search_settings.py` | 1263 |  |
| GET | `/search-settings/get-all-search-settings` | `get_all_search_settings` | `server/manage/search_settings.py` | 1106 |  |
| GET | `/search-settings/get-current-search-settings` | `get_current_search_settings_endpoint` | `server/manage/search_settings.py` | 845 |  |
| GET | `/search-settings/get-secondary-search-settings` | `get_secondary_search_settings_endpoint` | `server/manage/search_settings.py` | 854 |  |
| GET | `/search-settings/reindex-errors` | `get_reindex_errors` | `server/manage/search_settings.py` | 1045 |  |
| GET | `/search-settings/reindex-progress` | `get_reindex_progress` | `server/manage/search_settings.py` | 894 |  |
| POST | `/search-settings/reindex/port/resume` | `resume_paused_port` | `server/manage/search_settings.py` | 1067 |  |
| POST | `/search-settings/set-new-search-settings` | `set_new_search_settings` | `server/manage/search_settings.py` | 144 | [Depends(require_vector_db)] |
| GET | `/search-settings/unstructured-api-key-set` | `unstructured_api_key_set` | `server/manage/search_settings.py` | 1247 |  |
| POST | `/search-settings/update-inference-settings` | `update_saved_search_settings` | `server/manage/search_settings.py` | 1159 |  |
| PUT | `/search-settings/upsert-unstructured-api-key` | `upsert_unstructured_api_key` | `server/manage/search_settings.py` | 1255 |  |
| GET | `/search-settings/vector-quantization-support` | `get_vector_quantization_support` | `server/manage/search_settings.py` | 813 | [Depends(require_vector_db)] |

### Slack bot management

10 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/manage/admin/slack-app/bots` | `list_bots` | `server/manage/slack_bot.py` | 325 |  |
| POST | `/manage/admin/slack-app/bots` | `create_bot` | `server/manage/slack_bot.py` | 233 |  |
| GET | `/manage/admin/slack-app/bots/{bot_id}/config` | `list_bot_configs` | `server/manage/slack_bot.py` | 336 |  |
| DELETE | `/manage/admin/slack-app/bots/{slack_bot_id}` | `delete_bot` | `server/manage/slack_bot.py` | 300 |  |
| GET | `/manage/admin/slack-app/bots/{slack_bot_id}` | `get_bot_by_id` | `server/manage/slack_bot.py` | 312 |  |
| PATCH | `/manage/admin/slack-app/bots/{slack_bot_id}` | `patch_bot` | `server/manage/slack_bot.py` | 278 |  |
| GET | `/manage/admin/slack-app/channel` | `list_slack_channel_configs` | `server/manage/slack_bot.py` | 221 |  |
| POST | `/manage/admin/slack-app/channel` | `create_slack_channel_config` | `server/manage/slack_bot.py` | 113 |  |
| DELETE | `/manage/admin/slack-app/channel/{slack_channel_config_id}` | `delete_slack_channel_config` | `server/manage/slack_bot.py` | 209 |  |
| PATCH | `/manage/admin/slack-app/channel/{slack_channel_config_id}` | `patch_slack_channel_config` | `server/manage/slack_bot.py` | 150 |  |

### Discord bot management

11 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| DELETE | `/manage/admin/discord-bot/config` | `delete_bot_config_endpoint` | `server/manage/discord_bot/api.py` | 110 |  |
| GET | `/manage/admin/discord-bot/config` | `get_bot_config` | `server/manage/discord_bot/api.py` | 66 |  |
| POST | `/manage/admin/discord-bot/config` | `create_bot_request` | `server/manage/discord_bot/api.py` | 83 |  |
| GET | `/manage/admin/discord-bot/guilds` | `list_guild_configs` | `server/manage/discord_bot/api.py` | 157 |  |
| POST | `/manage/admin/discord-bot/guilds` | `create_guild_request` | `server/manage/discord_bot/api.py` | 167 |  |
| DELETE | `/manage/admin/discord-bot/guilds/{config_id}` | `delete_guild_request` | `server/manage/discord_bot/api.py` | 221 |  |
| GET | `/manage/admin/discord-bot/guilds/{config_id}` | `get_guild_config` | `server/manage/discord_bot/api.py` | 185 |  |
| PATCH | `/manage/admin/discord-bot/guilds/{config_id}` | `update_guild_request` | `server/manage/discord_bot/api.py` | 198 |  |
| GET | `/manage/admin/discord-bot/guilds/{config_id}/channels` | `list_channel_configs` | `server/manage/discord_bot/api.py` | 248 |  |
| PATCH | `/manage/admin/discord-bot/guilds/{guild_config_id}/channels/{channel_config_id}` | `update_channel_request` | `server/manage/discord_bot/api.py` | 267 |  |
| DELETE | `/manage/admin/discord-bot/service-api-key` | `delete_service_api_key_endpoint` | `server/manage/discord_bot/api.py` | 134 |  |

### Assistants (persona)

19 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/persona` | `list_personas_admin` | `server/features/persona/api.py` | 256 | api-key public API |
| DELETE | `/admin/persona/label/{label_id}` | `delete_label` | `server/features/persona/api.py` | 475 |  |
| PATCH | `/admin/persona/label/{label_id}` | `patch_persona_label` | `server/features/persona/api.py` | 461 |  |
| POST | `/admin/persona/upload-image` | `upload_file` | `server/features/persona/api.py` | 336 |  |
| PATCH | `/admin/persona/{persona_id}/featured` | `patch_persona_featured_status` | `server/features/persona/api.py` | 210 |  |
| PATCH | `/admin/persona/{persona_id}/listed` | `patch_persona_visibility` | `server/features/persona/api.py` | 173 |  |
| PATCH | `/admin/persona/{persona_id}/undelete` | `undelete_persona` | `server/features/persona/api.py` | 318 | api-key public API |
| GET | `/persona` | `list_personas` | `server/features/persona/api.py` | 667 | [Depends(scope_exempt)] |
| POST | `/persona` | `create_persona` | `server/features/persona/api.py` | 376 | api-key public API |
| GET | `/persona/labels` | `get_labels` | `server/features/persona/api.py` | 433 |  |
| POST | `/persona/labels` | `create_label` | `server/features/persona/api.py` | 444 |  |
| DELETE | `/persona/{persona_id}` | `delete_persona` | `server/features/persona/api.py` | 611 | api-key public API |
| GET | `/persona/{persona_id}` | `get_persona` | `server/features/persona/api.py` | 735 | api-key public API |
| PATCH | `/persona/{persona_id}` | `update_persona` | `server/features/persona/api.py` | 405 | api-key public API |
| GET | `/persona/{persona_id}/avatar` | `get_persona_avatar` | `server/features/persona/api.py` | 857 |  |
| PATCH | `/persona/{persona_id}/public` | `patch_user_persona_public_status` | `server/features/persona/api.py` | 188 |  |
| PATCH | `/persona/{persona_id}/share` | `share_persona` | `server/features/persona/api.py` | 517 |  |
| DELETE | `/persona/{persona_id}/share/me` | `leave_persona_shares` | `server/features/persona/api.py` | 594 |  |
| POST | `/persona/{persona_id}/transfer-ownership` | `transfer_persona_ownership_endpoint` | `server/features/persona/api.py` | 568 |  |

### Agents

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/agents` | `get_agents_admin_paginated` | `server/features/persona/api.py` | 271 | api-key public API |
| PATCH | `/admin/agents/display-priorities` | `patch_agents_display_priorities` | `server/features/persona/api.py` | 229 |  |
| GET | `/agents` | `get_agents_paginated` | `server/features/persona/api.py` | 687 | api-key public API |

### Default assistant

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| PATCH | `/admin/default-assistant` | `update_default_assistant` | `server/features/default_assistant/api.py` | 62 |  |
| GET | `/admin/default-assistant/configuration` | `get_default_assistant_configuration` | `server/features/default_assistant/api.py` | 50 |  |
| PATCH | `/admin/default-assistant/tools` | `update_default_assistant_tools` | `server/features/default_assistant/api.py` | 83 |  |

### Notifications

4 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/notifications` | `get_notifications_api` | `server/features/notifications/api.py` | 115 |  |
| POST | `/notifications/dismiss-all` | `dismiss_all_notifications_endpoint` | `server/features/notifications/api.py` | 215 |  |
| GET | `/notifications/summary` | `get_notifications_summary_api` | `server/features/notifications/api.py` | 196 |  |
| POST | `/notifications/{notification_id}/dismiss` | `dismiss_notification_endpoint` | `server/features/notifications/api.py` | 223 |  |

### Banner (admin)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| DELETE | `/admin/banner` | `delete_admin_banner` | `server/features/admin_banner/api.py` | 65 |  |
| GET | `/admin/banner` | `get_admin_banner_config` | `server/features/admin_banner/api.py` | 37 |  |
| PUT | `/admin/banner` | `upsert_admin_banner` | `server/features/admin_banner/api.py` | 44 |  |

### Tools

8 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/admin/tool/custom` | `create_custom_tool` | `server/features/tool/api.py` | 278 | api-key public API |
| POST | `/admin/tool/custom/validate` | `validate_tool` | `server/features/tool/api.py` | 400 | api-key public API |
| DELETE | `/admin/tool/custom/{tool_id}` | `delete_custom_tool` | `server/features/tool/api.py` | 379 | api-key public API |
| PUT | `/admin/tool/custom/{tool_id}` | `update_custom_tool` | `server/features/tool/api.py` | 312 | api-key public API |
| GET | `/tool` | `list_tools` | `server/features/tool/api.py` | 512 | api-key public API |
| GET | `/tool/openapi` | `list_openapi_tools` | `server/features/tool/api.py` | 442 | api-key public API |
| GET | `/tool/{tool_id}` | `get_custom_tool` | `server/features/tool/api.py` | 455 | api-key public API |
| PATCH | `/tool/{tool_id}/preferences` | `update_tool_user_preferences` | `server/features/tool/api.py` | 484 | api-key public API |

### State / health

5 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/auth/type` | `get_auth_type` | `server/manage/get_state.py` | 206 | api-key public API |
| GET | `/health` | `healthcheck` | `server/manage/get_state.py` | 194 | api-key public API |
| GET | `/health/ready` | `readiness` | `server/manage/get_state.py` | 142 | response_model=None; api-key public API |
| GET | `/version` | `get_version` | `server/manage/get_state.py` | 252 | api-key public API |
| GET | `/versions` | `get_versions` | `server/manage/get_state.py` | 396 | api-key public API |

### Onyx API (ingestion, API-key)

4 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/onyx-api/connector-docs/{cc_pair_id}` | `get_docs_by_connector_credential_pair` | `server/onyx_api/ingestion.py` | 58 |  |
| GET | `/onyx-api/ingestion` | `get_ingestion_docs` | `server/onyx_api/ingestion.py` | 86 |  |
| POST | `/onyx-api/ingestion` | `upsert_ingestion_doc` | `server/onyx_api/ingestion.py` | 103 | [Depends(require_vector_db)] |
| DELETE | `/onyx-api/ingestion/{document_id}` | `delete_ingestion_doc` | `server/onyx_api/ingestion.py` | 251 | [Depends(require_vector_db)] |

### Settings

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| PATCH | `/admin/settings` | `admin_patch_settings` | `server/settings/api.py` | 78 |  |
| GET | `/settings` | `fetch_settings` | `server/settings/api.py` | 192 |  |

### Security keys (admin)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/security` | `get_security_settings_endpoint` | `server/security/api.py` | 62 |  |
| PUT | `/admin/security` | `put_security_settings_endpoint` | `server/security/api.py` | 77 |  |
| GET | `/admin/security/pinned-fields` | `get_pinned_fields_endpoint` | `server/security/api.py` | 69 |  |

### SSO providers (admin)

9 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/admin/sso/domain/records` | `sso_domain_records_endpoint` | `server/manage/sso/api.py` | 388 |  |
| POST | `/admin/sso/domain/verify-dns` | `verify_sso_domain_via_dns_endpoint` | `server/manage/sso/api.py` | 400 |  |
| GET | `/admin/sso/provider` | `list_sso_providers` | `server/manage/sso/api.py` | 174 |  |
| POST | `/admin/sso/provider` | `create_sso_provider_endpoint` | `server/manage/sso/api.py` | 185 |  |
| GET | `/admin/sso/provider-type` | `list_supported_sso_provider_types` | `server/manage/sso/api.py` | 165 |  |
| DELETE | `/admin/sso/provider/{provider_id}` | `delete_sso_provider_endpoint` | `server/manage/sso/api.py` | 312 |  |
| PATCH | `/admin/sso/provider/{provider_id}` | `update_sso_provider_endpoint` | `server/manage/sso/api.py` | 222 |  |
| POST | `/admin/sso/provider/{provider_id}/enabled` | `set_sso_provider_enabled_endpoint` | `server/manage/sso/api.py` | 262 |  |
| GET | `/admin/sso/provider/{provider_id}/handoff` | `sso_provider_handoff_endpoint` | `server/manage/sso/api.py` | 297 |  |

### LLM (admin)

38 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/llm/auto-config` | `get_auto_config` | `server/manage/llm/api.py` | 1451 |  |
| POST | `/admin/llm/bedrock/available-models` | `get_bedrock_available_models` | `server/manage/llm/api.py` | 1973 |  |
| POST | `/admin/llm/bifrost/available-models` | `get_bifrost_available_models` | `server/manage/llm/api.py` | 2753 |  |
| GET | `/admin/llm/built-in/options` | `fetch_llm_options` | `server/manage/llm/api.py` | 519 |  |
| GET | `/admin/llm/built-in/options/{provider_name}` | `fetch_llm_provider_options` | `server/manage/llm/api.py` | 526 |  |
| GET | `/admin/llm/custom-provider-names` | `fetch_custom_provider_names` | `server/manage/llm/api.py` | 494 |  |
| DELETE | `/admin/llm/decision-model` | `delete_decision_model` | `server/manage/llm/api.py` | 1442 |  |
| GET | `/admin/llm/decision-model` | `get_decision_model_configuration` | `server/manage/llm/api.py` | 1392 |  |
| POST | `/admin/llm/decision-model` | `set_decision_model` | `server/manage/llm/api.py` | 1421 |  |
| PUT | `/admin/llm/decision-provider` | `put_decision_provider` | `server/manage/llm/api.py` | 978 |  |
| POST | `/admin/llm/decision-provider/test` | `test_decision_provider` | `server/manage/llm/api.py` | 1008 |  |
| POST | `/admin/llm/default` | `set_provider_as_default` | `server/manage/llm/api.py` | 1280 |  |
| DELETE | `/admin/llm/default-chat-naming` | `clear_default_chat_naming` | `server/manage/llm/api.py` | 1330 |  |
| POST | `/admin/llm/default-chat-naming` | `set_provider_as_default_chat_naming` | `server/manage/llm/api.py` | 1312 |  |
| DELETE | `/admin/llm/default-craft` | `clear_default_craft` | `server/manage/llm/api.py` | 1355 |  |
| POST | `/admin/llm/default-craft` | `set_provider_as_default_craft` | `server/manage/llm/api.py` | 1340 |  |
| DELETE | `/admin/llm/default-search-selection` | `clear_default_search_selection` | `server/manage/llm/api.py` | 1383 |  |
| POST | `/admin/llm/default-search-selection` | `set_provider_as_default_search_selection` | `server/manage/llm/api.py` | 1365 |  |
| POST | `/admin/llm/default-vision` | `set_provider_as_default_vision` | `server/manage/llm/api.py` | 1298 |  |
| POST | `/admin/llm/litellm/available-models` | `get_litellm_available_models` | `server/manage/llm/api.py` | 2604 |  |
| POST | `/admin/llm/lm-studio/available-models` | `get_lm_studio_available_models` | `server/manage/llm/api.py` | 2481 |  |
| PATCH | `/admin/llm/model-routing` | `update_model_routing` | `server/manage/llm/api.py` | 843 |  |
| POST | `/admin/llm/nebius-tokenfactory/available-models` | `get_nebius_tokenfactory_available_models` | `server/manage/llm/api.py` | 2892 |  |
| POST | `/admin/llm/ollama/available-models` | `get_ollama_available_models` | `server/manage/llm/api.py` | 2183 |  |
| POST | `/admin/llm/openai-compatible/available-models` | `get_openai_compatible_server_available_models` | `server/manage/llm/api.py` | 3006 |  |
| POST | `/admin/llm/openrouter/available-models` | `get_openrouter_available_models` | `server/manage/llm/api.py` | 2364 |  |
| POST | `/admin/llm/portkey/available-models` | `get_portkey_available_models` | `server/manage/llm/api.py` | 3237 |  |
| GET | `/admin/llm/provider` | `list_llm_providers` | `server/manage/llm/api.py` | 715 |  |
| PUT | `/admin/llm/provider` | `put_llm_provider` | `server/manage/llm/api.py` | 1072 |  |
| GET | `/admin/llm/provider-contextual-cost` | `get_provider_contextual_cost` | `server/manage/llm/api.py` | 1890 |  |
| DELETE | `/admin/llm/provider/{provider_id}` | `delete_llm_provider` | `server/manage/llm/api.py` | 1239 |  |
| GET | `/admin/llm/provider/{provider_id}` | `get_llm_provider` | `server/manage/llm/api.py` | 804 |  |
| GET | `/admin/llm/router-models` | `list_router_model_providers` | `server/manage/llm/api.py` | 822 |  |
| POST | `/admin/llm/test` | `test_llm_configuration` | `server/manage/llm/api.py` | 604 |  |
| POST | `/admin/llm/test/default` | `test_default_provider` | `server/manage/llm/api.py` | 700 |  |
| POST | `/admin/llm/typesafe/available-models` | `get_typesafe_available_models` | `server/manage/llm/api.py` | 2313 |  |
| POST | `/admin/llm/vercel-ai-gateway/available-models` | `get_vercel_ai_gateway_available_models` | `server/manage/llm/api.py` | 3124 |  |
| GET | `/admin/llm/vision-providers` | `get_vision_capable_providers` | `server/manage/llm/api.py` | 1469 |  |

### Knowledge graph (admin)

6 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/kg/config` | `get_kg_config` | `server/kg/api.py` | 83 |  |
| PUT | `/admin/kg/config` | `enable_or_disable_kg` | `server/kg/api.py` | 91 |  |
| GET | `/admin/kg/entity-types` | `get_kg_entity_types` | `server/kg/api.py` | 177 |  |
| PUT | `/admin/kg/entity-types` | `update_kg_entity_types` | `server/kg/api.py` | 207 |  |
| GET | `/admin/kg/exposed` | `get_kg_exposed` | `server/kg/api.py` | 59 |  |
| PUT | `/admin/kg/reset` | `reset_kg` | `server/kg/api.py` | 70 |  |

### LLM (user)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/llm/persona/{persona_id}/providers` | `list_llm_providers_for_persona` | `server/manage/llm/api.py` | 1788 |  |
| GET | `/llm/provider` | `list_llm_provider_basics` | `server/manage/llm/api.py` | 1634 |  |
| GET | `/llm/provider/{provider_id}/models` | `list_llm_provider_models` | `server/manage/llm/api.py` | 1582 | [Depends(scope_exempt)] |

### Code interpreter (admin)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/code-interpreter` | `get_code_interpreter` | `server/manage/code_interpreter/api.py` | 39 |  |
| PUT | `/admin/code-interpreter` | `update_code_interpreter` | `server/manage/code_interpreter/api.py` | 48 |  |
| GET | `/admin/code-interpreter/health` | `get_code_interpreter_health` | `server/manage/code_interpreter/api.py` | 24 |  |

### Image generation (admin)

10 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/image-generation/config` | `get_all_configs` | `server/manage/image_generation/api.py` | 409 |  |
| POST | `/admin/image-generation/config` | `create_config` | `server/manage/image_generation/api.py` | 246 |  |
| POST | `/admin/image-generation/config/link` | `link_config` | `server/manage/image_generation/api.py` | 363 |  |
| DELETE | `/admin/image-generation/config/{image_provider_id}` | `delete_config` | `server/manage/image_generation/api.py` | 545 |  |
| PUT | `/admin/image-generation/config/{image_provider_id}` | `update_config` | `server/manage/image_generation/api.py` | 445 |  |
| GET | `/admin/image-generation/config/{image_provider_id}/credentials` | `get_config_credentials` | `server/manage/image_generation/api.py` | 419 |  |
| DELETE | `/admin/image-generation/config/{image_provider_id}/default` | `unset_config_as_default` | `server/manage/image_generation/api.py` | 596 |  |
| POST | `/admin/image-generation/config/{image_provider_id}/default` | `set_config_as_default` | `server/manage/image_generation/api.py` | 583 |  |
| GET | `/admin/image-generation/llm-providers` | `list_llm_provider_image_models` | `server/manage/image_generation/api.py` | 309 |  |
| POST | `/admin/image-generation/test` | `test_image_generation` | `server/manage/image_generation/api.py` | 184 |  |

### Embedding (admin)

6 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/embedding` | `list_embedding_models` | `server/manage/embedding/api.py` | 83 |  |
| GET | `/admin/embedding/embedding-provider` | `list_embedding_providers` | `server/manage/embedding/api.py` | 92 |  |
| PUT | `/admin/embedding/embedding-provider` | `put_cloud_embedding_provider` | `server/manage/embedding/api.py` | 138 |  |
| DELETE | `/admin/embedding/embedding-provider/{provider_type}` | `delete_embedding_provider` | `server/manage/embedding/api.py` | 118 |  |
| GET | `/admin/embedding/embedding-provider/{provider_type}` | `get_embedding_provider` | `server/manage/embedding/api.py` | 103 |  |
| POST | `/admin/embedding/test-embedding` | `test_embedding_configuration` | `server/manage/embedding/api.py` | 55 |  |

### Web search (user)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/web-search/open-urls` | `execute_open_urls` | `server/features/web_search/api.py` | 290 |  |
| POST | `/web-search/search` | `execute_web_search` | `server/features/web_search/api.py` | 231 |  |
| POST | `/web-search/search-lite` | `execute_web_search_lite` | `server/features/web_search/api.py` | 274 |  |

### Web search providers (admin)

13 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/web-search/content-providers` | `list_content_providers` | `server/manage/web_search/api.py` | 345 |  |
| POST | `/admin/web-search/content-providers` | `upsert_content_provider_endpoint` | `server/manage/web_search/api.py` | 368 |  |
| POST | `/admin/web-search/content-providers/reset-default` | `reset_content_provider_default` | `server/manage/web_search/api.py` | 476 |  |
| POST | `/admin/web-search/content-providers/test` | `test_content_provider` | `server/manage/web_search/api.py` | 502 |  |
| DELETE | `/admin/web-search/content-providers/{provider_id}` | `delete_content_provider` | `server/manage/web_search/api.py` | 444 |  |
| POST | `/admin/web-search/content-providers/{provider_id}/activate` | `activate_content_provider` | `server/manage/web_search/api.py` | 454 |  |
| POST | `/admin/web-search/content-providers/{provider_id}/deactivate` | `deactivate_content_provider` | `server/manage/web_search/api.py` | 491 |  |
| GET | `/admin/web-search/search-providers` | `list_search_providers` | `server/manage/web_search/api.py` | 144 |  |
| POST | `/admin/web-search/search-providers` | `upsert_search_provider_endpoint` | `server/manage/web_search/api.py` | 167 |  |
| POST | `/admin/web-search/search-providers/test` | `test_search_provider` | `server/manage/web_search/api.py` | 289 |  |
| DELETE | `/admin/web-search/search-providers/{provider_id}` | `delete_search_provider` | `server/manage/web_search/api.py` | 246 |  |
| POST | `/admin/web-search/search-providers/{provider_id}/activate` | `activate_search_provider` | `server/manage/web_search/api.py` | 256 |  |
| POST | `/admin/web-search/search-providers/{provider_id}/deactivate` | `deactivate_search_provider` | `server/manage/web_search/api.py` | 278 |  |

### Tracing (admin)

5 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/tracing/providers` | `list_tracing_providers` | `server/manage/tracing/api.py` | 102 |  |
| POST | `/admin/tracing/providers` | `upsert_tracing_provider_endpoint` | `server/manage/tracing/api.py` | 116 |  |
| POST | `/admin/tracing/providers/test` | `test_tracing_provider` | `server/manage/tracing/api.py` | 151 |  |
| DELETE | `/admin/tracing/providers/{provider_type}` | `disconnect_tracing_provider` | `server/manage/tracing/api.py` | 138 |  |
| POST | `/admin/tracing/providers/{provider_type}/adopt-env` | `adopt_env_tracing_provider` | `server/manage/tracing/api.py` | 179 |  |

### Voice (admin)

10 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/voice/providers` | `list_voice_providers` | `server/manage/voice/api.py` | 238 |  |
| POST | `/admin/voice/providers` | `upsert_voice_provider_endpoint` | `server/manage/voice/api.py` | 248 |  |
| POST | `/admin/voice/providers/test` | `test_voice_provider` | `server/manage/voice/api.py` | 421 |  |
| DELETE | `/admin/voice/providers/{provider_id}` | `delete_voice_provider_endpoint` | `server/manage/voice/api.py` | 342 |  |
| POST | `/admin/voice/providers/{provider_id}/activate-stt` | `activate_stt_provider_endpoint` | `server/manage/voice/api.py` | 355 |  |
| POST | `/admin/voice/providers/{provider_id}/activate-tts` | `activate_tts_provider_endpoint` | `server/manage/voice/api.py` | 379 |  |
| POST | `/admin/voice/providers/{provider_id}/deactivate-stt` | `deactivate_stt_provider_endpoint` | `server/manage/voice/api.py` | 367 |  |
| POST | `/admin/voice/providers/{provider_id}/deactivate-tts` | `deactivate_tts_provider_endpoint` | `server/manage/voice/api.py` | 409 |  |
| GET | `/admin/voice/providers/{provider_id}/voices` | `get_provider_voices` | `server/manage/voice/api.py` | 507 |  |
| GET | `/admin/voice/voices` | `get_voices_by_type` | `server/manage/voice/api.py` | 531 |  |

### Voice (user)

5 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| PATCH | `/voice/settings` | `update_voice_settings` | `server/manage/voice/user_api.py` | 288 |  |
| GET | `/voice/status` | `get_voice_status` | `server/manage/voice/user_api.py` | 51 |  |
| POST | `/voice/synthesize` | `synthesize_speech` | `server/manage/voice/user_api.py` | 197 |  |
| POST | `/voice/transcribe` | `transcribe_audio` | `server/manage/voice/user_api.py` | 98 |  |
| POST | `/voice/ws-token` | `get_ws_token` | `server/manage/voice/user_api.py` | 310 |  |

### Voice websocket

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| WEBSOCKET | `/voice/synthesize/stream` | `websocket_synthesize` | `server/manage/voice/websocket_api.py` | 1225 |  |
| WEBSOCKET | `/voice/transcribe/stream` | `websocket_transcribe` | `server/manage/voice/websocket_api.py` | 759 |  |

### Cost overrides (admin)

4 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/cost-overrides` | `list_cost_overrides` | `server/features/usage/api.py` | 476 |  |
| POST | `/admin/cost-overrides` | `create_cost_override_endpoint` | `server/features/usage/api.py` | 484 |  |
| DELETE | `/admin/cost-overrides/{model_configuration_id}` | `delete_cost_override_endpoint` | `server/features/usage/api.py` | 556 |  |
| PUT | `/admin/cost-overrides/{model_configuration_id}` | `update_cost_override_endpoint` | `server/features/usage/api.py` | 517 |  |

### Usage (user)

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/user/usage` | `get_my_usage` | `server/features/usage/api.py` | 263 | [Depends(scope_exempt)] |

### Usage (admin)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/usage/export` | `export_usage` | `server/features/usage/api.py` | 361 |  |
| POST | `/admin/usage/reset` | `reset_usage` | `server/features/usage/api.py` | 455 |  |
| GET | `/admin/usage/system` | `get_system_usage` | `server/features/usage/api.py` | 407 |  |

### API keys (admin)

6 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/api-key` | `list_api_keys` | `server/api_key/api.py` | 31 |  |
| POST | `/admin/api-key` | `create_api_key` | `server/api_key/api.py` | 53 |  |
| DELETE | `/admin/api-key/{api_key_id}` | `delete_api_key` | `server/api_key/api.py` | 117 |  |
| GET | `/admin/api-key/{api_key_id}` | `get_api_key` | `server/api_key/api.py` | 39 |  |
| PATCH | `/admin/api-key/{api_key_id}` | `update_existing_api_key` | `server/api_key/api.py` | 94 |  |
| POST | `/admin/api-key/{api_key_id}/regenerate` | `regenerate_existing_api_key` | `server/api_key/api.py` | 75 |  |

### Connector OAuth (standard)

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/connector/oauth/authorize/{source}` | `oauth_authorize` | `server/documents/standard_oauth.py` | 188 |  |
| GET | `/connector/oauth/callback/{source}` | `oauth_callback` | `server/documents/standard_oauth.py` | 233 |  |
| GET | `/connector/oauth/details/{source}` | `oauth_details` | `server/documents/standard_oauth.py` | 286 |  |

### Federated connectors

15 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/federated` | `get_federated_connectors` | `server/federated/api.py` | 461 |  |
| POST | `/federated` | `create_federated_connector` | `server/federated/api.py` | 72 |  |
| POST | `/federated/callback` | `handle_oauth_callback_generic` | `server/federated/api.py` | 380 |  |
| GET | `/federated/oauth-status` | `get_user_oauth_status` | `server/federated/api.py` | 481 |  |
| GET | `/federated/sources/{source}/configuration/schema` | `get_configuration_schema_by_source` | `server/federated/api.py` | 204 |  |
| GET | `/federated/sources/{source}/credentials/schema` | `get_credentials_schema_by_source` | `server/federated/api.py` | 232 |  |
| POST | `/federated/sources/{source}/credentials/validate` | `validate_credentials` | `server/federated/api.py` | 263 |  |
| DELETE | `/federated/{id}` | `delete_federated_connector_endpoint` | `server/federated/api.py` | 604 |  |
| GET | `/federated/{id}` | `get_federated_connector_detail` | `server/federated/api.py` | 526 |  |
| PUT | `/federated/{id}` | `update_federated_connector_endpoint` | `server/federated/api.py` | 572 |  |
| GET | `/federated/{id}/authorize` | `get_authorize_url` | `server/federated/api.py` | 331 |  |
| GET | `/federated/{id}/credentials/schema` | `get_credentials_schema` | `server/federated/api.py` | 159 |  |
| GET | `/federated/{id}/entities` | `get_entities` | `server/federated/api.py` | 117 |  |
| HEAD | `/federated/{id}/entities/validate` | `validate_entities` | `server/federated/api.py` | 287 |  |
| DELETE | `/federated/{id}/oauth` | `disconnect_oauth_token` | `server/federated/api.py` | 622 |  |

### MCP

7 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/admin/mcp/oauth/discover` | `discover_admin_oauth` | `server/features/mcp/api.py` | 110 |  |
| POST | `/admin/mcp/probe` | `stream_admin_mcp_probe` | `server/features/mcp/api.py` | 93 |  |
| DELETE | `/admin/mcp/server/{server_id}` | `delete_mcp_server_alias` | `server/features/mcp/api.py` | 515 |  |
| PATCH | `/admin/mcp/server/{server_id}` | `update_mcp_server_alias` | `server/features/mcp/api.py` | 473 |  |
| POST | `/admin/mcp/servers/create` | `upsert_mcp_server_alias` | `server/features/mcp/api.py` | 372 |  |
| GET | `/admin/mcp/servers/{server_id}` | `get_mcp_server_alias` | `server/features/mcp/api.py` | 461 |  |
| GET | `/mcp/oauth/client-metadata` | `get_mcp_oauth_client_metadata` | `server/features/mcp/client_metadata.py` | 59 | api-key public API |

### Integrations

12 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/integrations` | `list_integrations_for_member` | `server/features/integrations/api.py` | 61 |  |
| GET | `/integrations/agent-catalog` | `get_agent_catalog` | `server/features/integrations/api.py` | 69 |  |
| GET | `/integrations/agents/{persona_id}` | `get_agent_integration_ids` | `server/features/integrations/api.py` | 77 |  |
| POST | `/integrations/oauth/callback` | `oauth_callback` | `server/features/integrations/connections_api.py` | 52 |  |
| GET | `/integrations/{integration_id}` | `get_integration_for_member` | `server/features/integrations/api.py` | 107 |  |
| GET | `/integrations/{integration_id}/access` | `get_integration_shares` | `server/features/integrations/api.py` | 134 |  |
| PUT | `/integrations/{integration_id}/access` | `set_integration_shares` | `server/features/integrations/api.py` | 145 |  |
| DELETE | `/integrations/{integration_id}/connection` | `delete_member_connection` | `server/features/integrations/api.py` | 198 |  |
| PUT | `/integrations/{integration_id}/connection` | `save_member_connection` | `server/features/integrations/api.py` | 184 |  |
| PUT | `/integrations/{integration_id}/enabled` | `set_integration_enabled` | `server/features/integrations/api.py` | 117 |  |
| POST | `/integrations/{integration_id}/oauth/start` | `start_oauth` | `server/features/integrations/connections_api.py` | 31 |  |
| POST | `/integrations/{integration_id}/publish` | `publish_integration` | `server/features/integrations/api.py` | 164 |  |

### Integrations (admin)

13 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/admin/integrations` | `list_integrations_admin` | `server/features/integrations/admin_api.py` | 55 |  |
| POST | `/admin/integrations` | `create_integration` | `server/features/integrations/admin_api.py` | 70 |  |
| GET | `/admin/integrations/presets` | `list_integration_presets` | `server/features/integrations/admin_api.py` | 63 |  |
| DELETE | `/admin/integrations/{integration_id}` | `delete_integration` | `server/features/integrations/admin_api.py` | 111 |  |
| GET | `/admin/integrations/{integration_id}` | `get_integration_admin` | `server/features/integrations/admin_api.py` | 84 |  |
| PATCH | `/admin/integrations/{integration_id}` | `update_integration` | `server/features/integrations/admin_api.py` | 94 |  |
| GET | `/admin/integrations/{integration_id}/actions` | `get_integration_actions` | `server/features/integrations/admin_api.py` | 166 |  |
| PUT | `/admin/integrations/{integration_id}/actions` | `set_integration_actions` | `server/features/integrations/admin_api.py` | 176 |  |
| POST | `/admin/integrations/{integration_id}/actions/refresh` | `refresh_integration_actions` | `server/features/integrations/admin_api.py` | 194 |  |
| PUT | `/admin/integrations/{integration_id}/group-settings` | `set_integration_group_settings` | `server/features/integrations/admin_api.py` | 142 |  |
| PUT | `/admin/integrations/{integration_id}/installation-policy` | `set_integration_installation_policy` | `server/features/integrations/admin_api.py` | 124 |  |
| DELETE | `/admin/integrations/{integration_id}/organization-connection` | `delete_organization_connection` | `server/features/integrations/admin_api.py` | 225 |  |
| PUT | `/admin/integrations/{integration_id}/organization-connection` | `save_organization_connection` | `server/features/integrations/admin_api.py` | 209 |  |

### Action policies (integrations)

2 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/action-policies/integration/{integration_id}` | `get_action_grants` | `server/features/integrations/api.py` | 211 |  |
| PUT | `/action-policies/integration/{integration_id}` | `save_action_grants` | `server/features/integrations/api.py` | 221 |  |

### Mobile plugins

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/plugins/agents/{persona_id}` | `get_agent_integration_ids_for_mobile` | `server/features/integrations/api.py` | 91 |  |

### Skills

31 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/skills` | `list_skills_for_current_user` | `server/features/skill/api.py` | 344 |  |
| POST | `/skills/bulk` | `bulk_update_skills` | `server/features/skill/api.py` | 362 |  |
| GET | `/skills/chat` | `list_chat_skills_for_current_user` | `server/features/skill/api.py` | 353 |  |
| POST | `/skills/custom` | `create_custom_skill` | `server/features/skill/api.py` | 497 |  |
| POST | `/skills/custom/batch` | `create_custom_skills_batch` | `server/features/skill/api.py` | 532 |  |
| POST | `/skills/custom/bundle/inspect` | `inspect_custom_skill_bundle_upload` | `server/features/skill/api.py` | 742 |  |
| POST | `/skills/custom/editor` | `create_custom_skill_from_editor` | `server/features/skill/api.py` | 655 |  |
| DELETE | `/skills/custom/{skill_id}` | `delete_current_user_skill` | `server/features/skill/api.py` | 1205 |  |
| PATCH | `/skills/custom/{skill_id}` | `patch_current_user_skill` | `server/features/skill/api.py` | 985 |  |
| PUT | `/skills/custom/{skill_id}/bundle` | `replace_current_user_skill_bundle` | `server/features/skill/api.py` | 905 |  |
| GET | `/skills/custom/{skill_id}/edit` | `fetch_custom_skill_for_edit` | `server/features/skill/api.py` | 729 |  |
| DELETE | `/skills/custom/{skill_id}/files` | `remove_current_user_skill_file` | `server/features/skill/api.py` | 964 |  |
| POST | `/skills/custom/{skill_id}/files` | `upload_current_user_skill_files` | `server/features/skill/api.py` | 944 |  |
| POST | `/skills/custom/{skill_id}/publish` | `publish_current_user_skill` | `server/features/skill/api.py` | 857 |  |
| GET | `/skills/custom/{skill_id}/share` | `fetch_custom_skill_sharing` | `server/features/skill/api.py` | 1093 |  |
| PATCH | `/skills/custom/{skill_id}/share` | `share_current_user_skill` | `server/features/skill/api.py` | 1105 |  |
| POST | `/skills/custom/{skill_id}/transfer-ownership` | `transfer_current_user_skill_ownership` | `server/features/skill/api.py` | 1143 |  |
| GET | `/skills/custom/{skill_id}/versions` | `list_custom_skill_versions` | `server/features/skill/api.py` | 788 |  |
| GET | `/skills/custom/{skill_id}/versions/{version_id}` | `preview_custom_skill_version` | `server/features/skill/api.py` | 815 |  |
| POST | `/skills/custom/{skill_id}/versions/{version_id}/approve` | `approve_skill_review` | `server/features/skill/api.py` | 877 |  |
| POST | `/skills/custom/{skill_id}/versions/{version_id}/deny` | `deny_skill_review` | `server/features/skill/api.py` | 892 |  |
| POST | `/skills/custom/{skill_id}/versions/{version_id}/restore` | `restore_custom_skill_version` | `server/features/skill/api.py` | 835 |  |
| POST | `/skills/github/import` | `import_github_skills` | `server/features/skill/api.py` | 593 |  |
| POST | `/skills/github/preview` | `preview_github_skills` | `server/features/skill/api.py` | 568 |  |
| GET | `/skills/organization-library/default-access` | `get_organization_library_default_access` | `server/features/skill/api.py` | 433 |  |
| PUT | `/skills/organization-library/default-access` | `set_organization_library_default_access` | `server/features/skill/api.py` | 443 |  |
| GET | `/skills/review-requests` | `list_skill_review_requests` | `server/features/skill/api.py` | 422 |  |
| GET | `/skills/users-over-limit` | `list_users_over_skill_limit` | `server/features/skill/api.py` | 459 |  |
| GET | `/skills/{skill_id}` | `fetch_skill_for_current_user` | `server/features/skill/api.py` | 473 |  |
| PUT | `/skills/{skill_id}/enabled` | `set_skill_enabled_for_current_user` | `server/features/skill/api.py` | 403 |  |
| GET | `/skills/{skill_id}/preview` | `preview_skill_for_current_user` | `server/features/skill/api.py` | 485 |  |

### Personal access tokens

4 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/user/pats` | `list_tokens` | `server/pat/api.py` | 83 |  |
| POST | `/user/pats` | `create_token` | `server/pat/api.py` | 93 |  |
| GET | `/user/pats/scopes` | `list_selectable_scopes` | `server/pat/api.py` | 65 |  |
| DELETE | `/user/pats/{token_id}` | `delete_token` | `server/pat/api.py` | 125 |  |

### Captcha

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/auth/captcha/oauth-verify` | `verify_oauth_captcha` | `server/auth/captcha_api.py` | 62 |  |

### OAuth provider (protocol) [conditional]

10 routes — **[conditional: OAUTH_PROVIDER_SETTINGS is not None]**.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/oauth-provider/authorize` | `authorize` | `server/oauth_provider/protocol.py` | 219 |  |
| POST | `/oauth-provider/authorize` | `authorize` | `server/oauth_provider/protocol.py` | 219 |  |
| GET | `/oauth-provider/metadata` | `metadata` | `server/oauth_provider/protocol.py` | 151 |  |
| OPTIONS | `/oauth-provider/metadata` | `metadata` | `server/oauth_provider/protocol.py` | 151 |  |
| OPTIONS | `/oauth-provider/register` | `register` | `server/oauth_provider/protocol.py` | 177 |  |
| POST | `/oauth-provider/register` | `register` | `server/oauth_provider/protocol.py` | 177 |  |
| OPTIONS | `/oauth-provider/revoke` | `revoke` | `server/oauth_provider/protocol.py` | 322 |  |
| POST | `/oauth-provider/revoke` | `revoke` | `server/oauth_provider/protocol.py` | 322 |  |
| OPTIONS | `/oauth-provider/token` | `token` | `server/oauth_provider/protocol.py` | 273 |  |
| POST | `/oauth-provider/token` | `token` | `server/oauth_provider/protocol.py` | 273 |  |

### OAuth provider (user) [conditional]

5 routes — **[conditional: OAUTH_PROVIDER_SETTINGS is not None]**.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/oauth-provider/consent` | `consent_details` | `server/oauth_provider/api.py` | 147 |  |
| POST | `/oauth-provider/consent` | `decide_consent` | `server/oauth_provider/api.py` | 186 |  |
| GET | `/oauth-provider/grants` | `connected_clients` | `server/oauth_provider/api.py` | 250 |  |
| DELETE | `/oauth-provider/grants/{grant_id}` | `disconnect_client` | `server/oauth_provider/api.py` | 262 |  |
| GET | `/oauth-provider/introspect` | `introspect` | `server/oauth_provider/api.py` | 127 |  |

### SAML multi-provider

5 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/auth/saml/authorize` | `saml_login` | `server/saml_multi.py` | 380 |  |
| POST | `/auth/saml/callback` | `saml_login_callback_post` | `server/saml_multi.py` | 415 |  |
| GET | `/auth/saml/complete` | `saml_login_complete` | `server/saml_multi.py` | 424 |  |
| POST | `/auth/saml/logout` | `saml_logout` | `server/saml_multi.py` | 553 |  |
| GET | `/auth/saml/{provider_name}/authorize` | `saml_login_for_provider` | `server/saml_multi.py` | 437 |  |

### OIDC multi-provider

3 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| GET | `/auth/oidc/callback` | `oidc_login_callback` | `server/oidc_multi.py` | 398 |  |
| GET | `/auth/oidc/{provider_name}/authorize` | `oidc_login_for_provider` | `server/oidc_multi.py` | 316 |  |
| GET | `/auth/oidc/{provider_name}/callback` | `oidc_login_callback_for_provider` | `server/oidc_multi.py` | 438 |  |

### SSO discovery

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/auth/sso/discover` | `discover_sso_providers` | `server/sso_discovery.py` | 148 |  |

### Mobile SSO exchange

1 routes.

| Method | Full path | Handler | Source (backend/onyx/…) | def line | Notes |
|---|---|---|---|---|---|
| POST | `/auth/mobile/sso/exchange` | `sso_exchange` | `server/auth/mobile.py` | 49 |  |

### Auth & user management (fastapi-users generated + Onyx mobile gateway)

Generated by fastapi-users 15.0.4 (paths verified from the installed wheel); mounted with
auth rate-limiter dependencies (`include_auth_router_with_prefix`, `onyx/main.py:299`).

| Method | Full path | Handler | Source | Notes |
|---|---|---|---|---|
| POST | `/auth/login` | `login (generated)` | fastapi_users.get_auth_router(auth_backend) | cookie/bearer backend; rate-limited |
| POST | `/auth/logout` | `logout (generated)` | fastapi_users.get_auth_router(auth_backend) |  |
| POST | `/auth/register` | `register (generated)` | fastapi_users.get_register_router(UserRead, UserCreate) |  |
| POST | `/auth/forgot-password` | `forgot_password (generated)` | fastapi_users.get_reset_password_router() |  |
| POST | `/auth/reset-password` | `reset_password (generated)` | fastapi_users.get_reset_password_router() |  |
| POST | `/auth/request-verify-token` | `request_verify_token (generated)` | fastapi_users.get_verify_router(UserRead) |  |
| POST | `/auth/verify` | `verify (generated)` | fastapi_users.get_verify_router(UserRead) |  |
| GET | `/users/me` | `get_user (generated)` | fastapi_users.get_users_router(UserRead, UserUpdate) | response_model=UserRead |
| PATCH | `/users/me` | `update_user (generated)` | fastapi_users.get_users_router(UserRead, UserUpdate) | response_model=UserRead |
| GET | `/users/{id}` | `get_user_by_id (generated)` | fastapi_users.get_users_router(UserRead, UserUpdate) | response_model=UserRead; requires_verification |
| PATCH | `/users/{id}` | `update_user_by_id (generated)` | fastapi_users.get_users_router(UserRead, UserUpdate) | response_model=UserRead; requires_verification |
| DELETE | `/users/{id}` | `delete_user_by_id (generated)` | fastapi_users.get_users_router(UserRead, UserUpdate) | requires_verification; superuser |
| POST | `/auth/refresh` | `refresh (Onyx custom)` | onyx/auth/users.py:2185 | FastAPIUserWithRefreshRouter.get_refresh_router; refreshes OAuth tokens too |

Mobile auth gateway (`onyx/server/auth/mobile.py`, prefix `/auth/mobile`; the `sso/exchange`
route below is decorator-defined and already counted in the summary):

| Method | Full path | Handler | Source | Notes |
|---|---|---|---|---|
| POST | `/auth/mobile/login` | `login (generated)` | fastapi_users.get_auth_router(mobile_auth_backend) | Bearer transport |
| POST | `/auth/mobile/logout` | `logout (generated)` | fastapi_users.get_auth_router(mobile_auth_backend) |  |
| POST | `/auth/mobile/refresh` | `refresh (generated)` | fastapi_users.get_refresh_router(mobile_auth_backend) |  |
| POST | `/auth/mobile/sso/exchange` | `sso_exchange` | backend/onyx/server/auth/mobile.py | decorator route; counted in AST totals |

Google OAuth routers — **[conditional: `OAUTH_ENABLED=true`, i.e. `OAUTH_CLIENT_ID`+`OAUTH_CLIENT_SECRET` set]**
(`create_onyx_oauth_router` at `onyx/auth/users.py:3094`; handlers `authorize`/`callback`):

| Method | Full path | Handler | Notes |
|---|---|---|---|
| GET | `/auth/oauth/authorize` | `authorize` | web cookie backend; response_model=OAuth2AuthorizeResponse |
| GET | `/auth/oauth/callback` | `callback` | web cookie backend |
| GET | `/auth/mobile/oauth/authorize` | `authorize` | mobile bearer backend; PKCE-capable |
| GET | `/auth/mobile/oauth/callback` | `callback` | mobile bearer backend |

### Special (app-level) routes

| Method | Full path | Source | Notes |
|---|---|---|---|
| GET | `/metrics` | `onyx/server/metrics/prometheus_setup.py:65` | Prometheus scrape; guarded by `verify_metrics_token` |
| GET | `/openapi.json` | FastAPI (`onyx/main.py:565`) | **[conditional: `ENABLE_PUBLIC_DOCS=true`]** |
| GET | `/docs` | FastAPI (`onyx/main.py:566`) | **[conditional: `ENABLE_PUBLIC_DOCS=true`]** |
| GET | `/redoc` | FastAPI (`onyx/main.py:567`) | **[conditional: `ENABLE_PUBLIC_DOCS=true`]** |

Rows listed in tables above: 632 (one row — `POST /auth/mobile/sso/exchange` — appears twice: once as a decorator route and once in the mobile auth gateway context; distinct routes = 631).

---

*Generated by AST extraction of `@router.<method>` decorators across `backend/onyx/server/**.py`
plus `onyx/auth/users.py` (generated auth routers), merged with the `app.include_router` sequence
in `onyx/main.py::get_application()`. fastapi-users paths verified against fastapi-users 15.0.4.*
