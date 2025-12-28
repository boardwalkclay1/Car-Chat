export const config = {
  runtime: "edge"
};

// In-memory room store
const rooms = new Map(); // roomId -> Set<WebSocket>

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  return rooms.get(roomId);
}

function broadcast(roomId, message, except = null) {
  const room = getRoom(roomId);
  for (const socket of room) {
    if (socket !== except && socket.readyState === socket.OPEN) {
      socket.send(message);
    }
  }
}

export default async function handler(req) {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  const url = new URL(req.url);
  const roomId = url.searchParams.get("room") || "global";

  const room = getRoom(roomId);
  room.add(server);

  server.accept();

  server.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);

      const packet = JSON.stringify({
        type: data.type,
        payload: data.payload,
        roomId,
        ts: Date.now()
      });

      broadcast(roomId, packet, server);
    } catch (err) {}
  });

  const cleanup = () => {
    room.delete(server);
  };

  server.addEventListener("close", cleanup);
  server.addEventListener("error", cleanup);

  return new Response(null, {
    status: 101,
    webSocket: client
  });
}
