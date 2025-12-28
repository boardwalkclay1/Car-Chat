export const config = {
  runtime: "edge"
};

// In-memory room store (Edge runtime keeps this alive per region)
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
  // Must be a WebSocket upgrade request
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 });
  }

  // Create WebSocket pair
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  // Determine room from query string
  const url = new URL(req.url);
  const roomId = url.searchParams.get("room") || "global";

  const room = getRoom(roomId);
  room.add(server);

  server.accept();

  // Handle messages from this client
  server.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);

      // Wrap message with metadata
      const packet = JSON.stringify({
        type: data.type,
        payload: data.payload,
        roomId,
        ts: Date.now()
      });

      // Broadcast to everyone else in the room
      broadcast(roomId, packet, server);
    } catch (err) {
      // Ignore malformed messages
    }
  });

  // Handle disconnect
  const cleanup = () => {
    room.delete(server);
  };

  server.addEventListener("close", cleanup);
  server.addEventListener("error", cleanup);

  // Return WebSocket to client
  return new Response(null, {
    status: 101,
    webSocket: client
  });
}
