import { RedisMemoryServer } from "redis-memory-server";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { createServer } from "http";
import express from "express";
import next from "next";
import { Server } from "socket.io";
import { mongoDBConncection } from "../src/app/dbConfig/db";
import messageModel from "../src/helper/model/message.model.ts";
import { initializeAgent } from "../src/service/GeminiAi.service.ts";
const redisServer = new RedisMemoryServer();

async function main() {
  const dev = process.env.NODE_ENV !== "production";
  // Specify the directory where Next.js app is located
  const app = next({ dev, dir: "./src" }); // Go up one level to the project root
  const handle = app.getRequestHandler();

  await mongoDBConncection();

  await app.prepare();

  const expressApp = express();
  const httpServer = createServer(expressApp);

  // Start in-memory Redis
  const host = await redisServer.getHost();
  const port = await redisServer.getPort();

  // Connect Redis clients (pub + sub)
  const pubClient = createClient({ url: `redis://${host}:${port}` });
  pubClient.on("error", (err) =>
    console.error("❌ Redis pubClient error:", err)
  );
  await pubClient.connect();

  const subClient = pubClient.duplicate();
  subClient.on("error", (err) =>
    console.error("❌ Redis subClient error:", err)
  ); // ✅
  await subClient.connect();
  console.log(`🧠 RedisMemoryServer running at redis://${host}:${port}`);
  // Attach Socket.IO with Redis adapter
  const io = new Server(httpServer, {
    cors: { origin: dev ? "http://localhost:3000" : undefined },
  });
  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      console.log("This is room", roomId);
      socket.join(roomId);
    });
    socket.on("message", async ({ roomId, text, from, to }) => {
      const msg = { roomId, text, from: from, to, ts: Date.now() };

      try {
        const savedMessage = await messageModel.create({
          sender: from,
          receiver: to,
          text,
          roomId,
        });
        if (savedMessage) {
          const mesg = {
            _id: savedMessage._id, // ✅ Include MongoDB _id
            roomId,
            text: savedMessage.text,
            from: savedMessage.sender, // you can keep this as 'from' if you want
            to: savedMessage.receiver,
            ts: savedMessage.createdAt || Date.now(), // or savedMessage.timestamp if you store one
          };

          io.to(roomId).emit("message", mesg);
        }
      } catch (error) {
        console.log(error);
      }

      // save to databse
    });
  });

//bot chat namespace

const botNamespace = io.of("/bot");

botNamespace.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
        if (roomId) {
            socket.join(roomId);
        }
    });
    
    socket.on("message", async ({ roomId, query, userId }) => {
        try {
            if (!roomId || !query || !userId) {
                return;
            }
            // Get AI response
            const aiResponse = await initializeAgent(query,userId);
            
            // Send response in the format your client expects
            botNamespace.to(roomId).emit("message", {
                roomId,
                sender: userId,
                aires: aiResponse?.aiRes || null
            });
            
        } catch (error) {
            console.log(error);
            // Send error response
            botNamespace.to(roomId).emit("message", {
                roomId,
                sender: userId,
                aires: "Sorry, I couldn't process your request."
            });
        }
    });
});



  expressApp.all("/*splat", (req, res) => {
    handle(req, res);
  });

  httpServer.listen(3001, () =>
    console.log("> Listening on http://localhost:3001")
  );
}

main().catch(console.error);



