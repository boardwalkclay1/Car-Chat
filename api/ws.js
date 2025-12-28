export const config = {
  runtime: "edge"
};

const rooms = new Map(); // roomId -> Set of WebSocket connections

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  return rooms.get(roomId);
}

function broadcast(roomId, message, exceptSocket = null) {
  const room = getRoom(roomId);
  for (const socket of room) {
    if (socket !== exceptSocket && socket.readyState === socket.OPEN) {
      socket.send(message);
    }
  }
}

export default async function handler(req) {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Requires WebSocket", { status: 426 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  const url = new URL(req.url);
  const roomId = url.searchParams.get("room") || "global";

  const room = getRoom(roomId);
  room.add(server);

  server.accept();

  server.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);

      if (!data.type) return;

      // Broadcast to everyone in the same room
      const payload = JSON.stringify({
        type: data.type,
        payload: data.payload || {},
        roomId,
        ts: Date.now()
      });

      broadcast(roomId, payload, server);
    } catch (e) {
      // ignore bad messages
    }
  });

  server.addEventListener("close", () => {
    room.delete(server);
  });

  server.addEventListener("error", () => {
    room.delete(server);
  });

  return new Response(null, {
    status: 101,
    webSocket: client
  });
}
