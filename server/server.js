// server/server.ts
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // change to frontend URL in production
    methods: ["GET", "POST"]
  }
});

// io.use(async(socket,next)=>{
//   try {
//     const token = socket.handshake.auth?.token || socket.handshake.headers.authorization.split(" ")[ 1 ];
//     const projectId= socket.handshake.query.projectId;

// if(!mongoose.Types.ObjectId.isValid(projectId)){
//   return next(new Error("Invalid projectId"))
// }
// socket.project= await 

//   } catch (error) {
    
//   }
// })







io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("message", (msg) => {
    console.log("message received:", msg);
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Socket.IO server running on http://localhost:3001");
});
