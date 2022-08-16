import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// import

const main = () => {
  const app = express();
  app.use(cors());
  const server = createServer(app);

  const io = new Server(server, {cors: "*"});

  app.get("/ok", (_, res) => {
    res.status(200).send("Server is running");
  });

  app.get("/html", (_, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("chat message", (msg) => {
      console.log("chat message", (msg));

      io.emit('chat message', msg);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  const port = 5040;
  server.listen(port, () => {
    console.log("Server running on port", port);
  });
};

main();