const WebSocket = require("ws");

// WebSocket Client
const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to the lift control server.");
});

ws.on("message", (data) => {
  const liftStatus = JSON.parse(data);
  console.log(`${liftStatus.lift} is currently at floor ${liftStatus.currentFloor}.`);
});

