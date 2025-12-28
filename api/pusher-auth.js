import Pusher from "pusher";

export default async function handler(req) {
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
  });

  const body = await req.text();
  const params = new URLSearchParams(body);

  const socketId = params.get("socket_id");
  const channel = params.get("channel_name");

  const auth = pusher.authenticate(socketId, channel, {
    user_id: "u-" + Math.random().toString(36).slice(2, 10)
  });

  return new Response(JSON.stringify(auth), {
    headers: { "Content-Type": "application/json" }
  });
}
