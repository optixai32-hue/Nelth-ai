/**
 * API server entry — Onyx Standard api_server equivalent (port 8080).
 * Runs `bun run dev` in mini-services/onyx-ts.
 * Migrations are applied on boot (Dockerfile CMD equivalent: alembic upgrade head && uvicorn).
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { API_PORT } from "./configs/constants.js";
import { getLogger } from "./utils/logger.js";
import { AuthError, OnyxError } from "./utils/errors.js";
import { runMigrations } from "./db/migrations/runner.js";
import { healthRoutes } from "./server/routes/health.js";
import { authRoutes } from "./server/routes/auth.js";
import { manageStateRoutes } from "./server/routes/manage_state.js";
import { manageUsersRoutes } from "./server/routes/manage_users.js";
import { userGroupRoutes } from "./server/routes/user_groups.js";
import { standardAnswerRoutes } from "./server/routes/standard_answers.js";
import { analyticsRoutes } from "./server/routes/analytics.js";
import { eeAdminRoutes } from "./server/routes/ee_admin.js";
import { settingsRoutes } from "./server/routes/settings.js";
import { notificationsRoutes } from "./server/routes/notifications.js";
import { llmRoutes, adminLlmRoutes } from "./server/routes/llm.js";
import { chatRoutes } from "./server/routes/chat.js";
import { searchRoutes } from "./server/routes/search.js";
import { documentsRoutes } from "./server/routes/documents.js";
import { connectorsRoutes } from "./server/routes/connectors.js";
import { adminRoutes } from "./server/routes/admin.js";
import { personasRoutes } from "./server/routes/personas.js";
import { toolsRoutes } from "./server/routes/tools.js";
import { artifactsRoutes } from "./server/routes/artifacts.js";
import { mcpRoutes } from "./server/routes/mcp.js";
import { integrationsRoutes } from "./server/routes/integrations.js";
import { featuresRoutes } from "./server/routes/features.js";
import { ensureDevPresetLlmProvider } from "./llm/setup.js";

const logger = getLogger("api.server");

const app = new Hono();

app.use("*", cors());
app.onError((err, c) => {
  // Port of FastAPI HTTPException semantics: {"detail": <literal>}
  if (err instanceof AuthError) {
    return c.json({ detail: err.detail }, err.httpStatus as 400);
  }
  if (err instanceof OnyxError) {
    return c.json({ detail: err.message, code: err.code }, err.httpStatus as 400);
  }
  logger.error("unhandled error", { error: String(err), path: c.req.path });
  return c.json({ detail: "Internal server error" }, 500);
});

// Port of FastAPI's default 404 handler: unmatched routes respond
// {"detail":"Not Found"} as JSON. The original frontend's parseFetcherResponse
// calls res.json() on every failure — a plain-text 404 raises SyntaxError
// inside the fetcher and breaks error classification (isNotFoundError).
app.notFound((c) => {
  return c.json({ detail: "Not Found" }, 404);
});

// Route mounts (mirrors FastAPI router inclusion in onyx.main.build_app)
app.route("/health", healthRoutes);
app.route("/auth", authRoutes);
app.route("/", manageStateRoutes); // /auth/type, /version (get_state.py)
app.route("/", manageUsersRoutes); // /me (server/manage/users.py)
app.route("/manage", userGroupRoutes); // /manage/admin/user-group (+ permissions registry, minimal groups) — EE
app.route("/manage", standardAnswerRoutes); // /manage/admin/standard-answer — EE
app.route("/", analyticsRoutes); // /user/usage, /admin/usage/*, /admin/usage-report, /analytics/admin/* — EE
app.route("/admin", eeAdminRoutes); // /admin/chat-session-history, scim token, log/query-history exports — EE
app.route("/", settingsRoutes); // /settings (server/settings/api.py)
app.route("/", notificationsRoutes); // /notifications (features/notifications/api.py)
app.route("/", llmRoutes); // /llm/provider (server/manage/llm/api.py)
app.route("/", adminLlmRoutes); // /admin/llm/provider admin surface
app.route("/chat", chatRoutes);
app.route("/search", searchRoutes);
app.route("/documents", documentsRoutes);
app.route("/manage", adminRoutes); // connectors/credentials/cc-pairs admin surface
app.route("/persona", personasRoutes); // /persona surface (server/features/persona/api.py)
app.route("/tools", toolsRoutes);
app.route("/tool", toolsRoutes); // GET /tool — original surface (list[ToolSnapshot])
app.route("/", integrationsRoutes); // /integrations surface
app.route("/artifacts", artifactsRoutes);
app.route("/mcp", mcpRoutes);
app.route("/", featuresRoutes); // /input_prompt, /mcp/servers, /query/valid-tags, ... feature read paths

async function main() {
  await runMigrations();
  await ensureDevPresetLlmProvider();
  Bun.serve({
    port: API_PORT,
    fetch: app.fetch,
    idleTimeout: 60,
  });
  logger.info(`onyx-ts api server listening on :${API_PORT} (Standard mode)`);
}

main().catch((err) => {
  logger.error("fatal startup error", { error: String(err) });
  process.exit(1);
});
