// Minimal diagnostic function: no app imports, responds instantly.
export const config = { runtime: "nodejs" };
export default async function () {
  return new Response(JSON.stringify({ ok: true, t: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
export const GET = () => new Response(JSON.stringify({ ok: true }), { status: 200 });
