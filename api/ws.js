<!DOCTYPE html>
<html>
<head>
  <title>acar chat test</title>
</head>
<body>
  <h1>acar chat realtime test</h1>

  <input id="msg" placeholder="type message" />
  <button onclick="send()">send</button>

  <pre id="log"></pre>

  <script>
    const log = document.getElementById("log");
    const ws = new WebSocket(`wss://${location.host}/api/ws?room=global`);

    ws.onopen = () => log.textContent += "connected\n";
    ws.onclose = () => log.textContent += "disconnected\n";
    ws.onerror = () => log.textContent += "error\n";

    ws.onmessage = (event) => {
      log.textContent += "recv: " + event.data + "\n";
    };

    function send() {
      const text = document.getElementById("msg").value;
      ws.send(JSON.stringify({
        type: "chat",
        payload: { text }
      }));
    }
  </script>
</body>
</html>
