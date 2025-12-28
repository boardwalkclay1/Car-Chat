import Pusher from "pusher";

export default async function handler(req) {
  const { text } = await req.json();

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
  });

  await pusher.trigger("presence-global", "chat-message", {
    text,
    name: "rider"
  });

  return new Response("ok");
}
