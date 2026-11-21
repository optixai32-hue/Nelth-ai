/**
 * Vercel serverless entry — mounts the same Hono app as the Bun entry
 * (src/index.ts) on the Node runtime. Every request path (e.g. /auth/login,
 * /settings) reaches this function via the vercel.json rewrite, and Hono
 * routes on the original request URL.
 *
 * No Bun.serve here: `export default` handler is invoked by Vercel per request.
 * Migrations + LLM provider seeding run lazily once per cold start
 * (ensureServerlessInit is idempotent per process).
 */
import { app } from "../src/server/app.js";
import { ensureServerlessInit } from "../src/server/vercel_init.js";

export const config = { runtime: "nodejs" };

type Handler = (req: Request) => Response | Promise<Response>;

const handler: Handler = async (req: Request) => {
  await ensureServerlessInit();
  return app.fetch(req);
};

export default handler;

// Named exports for the Vercel Node builder (it expects per-method exports
// or a default; provide both shapes for maximum compatibility).
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
