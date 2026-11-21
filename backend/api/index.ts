/**
 * Vercel serverless entry — mounts the same Hono app as the Bun entry
 * (src/index.ts) on the Node runtime.
 *
 * Routing model: the frontend (web) calls this service with paths prefixed
 * by /api (INTERNAL_URL = https://<host>/api). The api/ directory maps
 * api/index.ts to the /api path; the handler strips the /api prefix and
 * dispatches to the Hono app, which mounts /auth, /settings, /chat, ...
 * Top-level paths (no /api prefix) are dispatched unchanged.
 */
import { app } from "../src/server/app.js";
import { ensureServerlessInit } from "../src/server/vercel_init.js";

export const config = { runtime: "nodejs" };

type Handler = (req: Request) => Response | Promise<Response>;

const API_PREFIX = "/api";

const handler: Handler = async (req: Request) => {
  await ensureServerlessInit();
  const url = new URL(req.url);
  let path = url.pathname;
  if (path === API_PREFIX) {
    path = "/";
  } else if (path.startsWith(API_PREFIX + "/")) {
    path = path.slice(API_PREFIX.length);
  }
  if (path !== url.pathname) {
    url.pathname = path;
    return app.fetch(new Request(url.toString(), req));
  }
  return app.fetch(req);
};

export default handler;

// Per-method exports for the Vercel Node builder.
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
