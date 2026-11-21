// Minimal diagnostic function: no app imports, responds instantly.
export const config = { runtime: "nodejs" };
export const GET = async () =>
  new Response(JSON.stringify({ ok: true, t: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
