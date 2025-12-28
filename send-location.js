import Pusher from "pusher";

export default async function handler(req) {
  const { lat, lng } = await req.json();

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
  });

  await pusher.trigger("presence-global", "location-update", {
    id: "u-" + Math.random().toString(36).slice(2, 10),
    lat,
    lng
  });

  return new Response("ok");
}
