import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const main = () => {
  const app = express();
  app.use(cors());
  const server = createServer(app);

  const io = new Server(server, { cors: "*" });

  app.get("/ok", (_, res) => {
    res.status(200).send("Server is running");
  });

  io.on("connection", (socket) => {
    socket.on("connection", ({ user }) => console.log(user, "connected. Room -", socket.rooms));
    socket.on("chat message", (msg) => {
      console.log("chat message", msg);

      io.emit("chat message", msg);
    });

    socket.on("disconnecting", (_) => {
      console.log("Room closed -", socket.rooms);
    });

    // socket.on("disconnect", (socket) => {
    //   console.log(socket, "- user disconnected");
    // });
  });

  const port = 5040;
  server.listen(port, () => {
    console.log("Server running on port", port);
  });
};

main();
