export default {
  async fetch(req) {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response("Not a WebSocket request", { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());

    server.accept();

    server.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      // Broadcast to all connected clients
      server.dispatchEvent(
        new MessageEvent("message", {
          data: JSON.stringify({
            type: data.type,
            payload: data.payload
          })
        })
      );
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
};
