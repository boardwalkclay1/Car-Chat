export default async function handler(req) {
  const body = await req.json();

  await fetch(process.env.WS_URL, {
    method: "POST",
    body: JSON.stringify({
      type: "chat",
      payload: body
    })
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
