const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const servers = [];
const usedPorts = new Set();

function generatePort() {
for (let i = 19132; i <= 19999; i++) {
if (!usedPorts.has(i)) {
usedPorts.add(i);
return i;
}
}
return null;
}

app.get("/api/servers", (req, res) => {
res.json(servers);
});

app.post("/api/servers", (req, res) => {
const name = String(req.body.name || "").trim();

if (!name || name.length > 40) {
return res.status(400).json({
error: "Server name is required (max 40 characters)."
});
}

let port;

if (req.body.port === undefined ||
req.body.port === null ||
req.body.port === "") {
port = generatePort();
} else {
port = Number(req.body.port);

if (!Number.isInteger(port) ||
    port < 1024 || port > 65535 ||
    usedPorts.has(port)) {
  return res.status(400).json({
    error: "Invalid or unavailable port."
  });
}

usedPorts.add(port);

}

if (!port) {
return res.status(503).json({
error: "No available ports."
});
}

const server = {
id: crypto.randomUUID(),
name,
port,
address: process.env.GAME_SERVER_ADDRESS || "NOT_CONFIGURED",
status: "NOT_CONFIGURED",
createdAt: new Date().toISOString()
};

servers.push(server);

res.status(201).json(server);
});

app.get("/health", (req, res) => {
res.json({
status: "online",
service: "BANGLADESH SERVER HOST"
});
});

app.listen(PORT, "0.0.0.0", () => {
console.log("Server panel listening on port ${PORT}");
});