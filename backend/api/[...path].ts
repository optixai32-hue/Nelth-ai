/**
 * Vercel catch-all for /api/<sub-path> — delegates to the same handler as
 * api/index.ts (Vercel maps api/index.ts to /api exactly, and this file to
 * /api/<anything>).
 */
import { vercelHandler } from "./index.js";

export const config = { runtime: "nodejs" };

export default vercelHandler;
export const GET = vercelHandler;
export const POST = vercelHandler;
export const PUT = vercelHandler;
export const PATCH = vercelHandler;
export const DELETE = vercelHandler;
export const HEAD = vercelHandler;
export const OPTIONS = vercelHandler;
