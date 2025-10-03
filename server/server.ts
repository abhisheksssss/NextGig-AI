import { RedisMemoryServer } from "redis-memory-server";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { createServer } from "http";
import express from "express";
import next from "next";
import { Server } from "socket.io";
import { mongoDBConncection } from "../src/app/dbConfig/db";
import messageModel from "../src/helper/model/message.model";
import { initializeAgent } from "../src/service/GeminiAi.service";

const redisServer = new RedisMemoryServer();

async function main() {
  const dev = process.env.NODE_ENV !== "production";
  const port = parseInt(process.env.PORT || "3001", 10);
  
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  await mongoDBConncection();
  await nextApp.prepare();
  console.log("✅ Next.js prepared");

  const app = express();
  const server = createServer(app);

  const host = await redisServer.getHost();
  const redisPort = await redisServer.getPort();

  const pubClient = createClient({ url: `redis://${host}:${redisPort}` });
  await pubClient.connect();
  pubClient.on("error", (err) => console.error("Redis pub error:", err));

  const subClient = pubClient.duplicate();
  await subClient.connect();
  subClient.on("error", (err) => console.error("Redis sub error:", err));
  
  console.log(`🧠 Redis running at redis://${host}:${redisPort}`);

  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"]
  });
  
  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
    
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    
    socket.on("message", async ({ roomId, text, from, to }) => {
      try {
        const savedMessage = await messageModel.create({
          sender: from,
          receiver: to,
          text,
          roomId,
        });
        
        if (savedMessage) {
          io.to(roomId).emit("message", {
            _id: savedMessage._id,
            roomId,
            text: savedMessage.text,
            from: savedMessage.sender,
            to: savedMessage.receiver,
            ts: savedMessage.createdAt || Date.now(),
          });
        }
      } catch (error) {
        console.error("Message error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  const botNamespace = io.of("/bot");
  
  botNamespace.on("connection", (socket) => {
    console.log("✅ Bot client connected:", socket.id);
    
    socket.on("join-room", (roomId) => {
      if (roomId) {
        socket.join(roomId);
        console.log(`Bot socket ${socket.id} joined room ${roomId}`);
      }
    });
    
    socket.on("message", async ({ roomId, query, userId }) => {
      try {
        if (!roomId || !query || !userId) return;
        
        const aiResponse = await initializeAgent(
          query,
          userId,
          `session-${roomId}-${new Date().toDateString()}`
        );
        
        botNamespace.to(roomId).emit("message", {
          roomId,
          sender: userId,
          aires: aiResponse?.aiRes || null
        });
      } catch (error) {
        console.error("Bot error:", error);
        botNamespace.to(roomId).emit("message", {
          roomId,
          sender: userId,
          aires: "Sorry, I couldn't process your request."
        });
      }
    });
  });

  // Parse request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ✅ THIS IS THE FIX - Use a callback function instead of wildcards
  app.use((req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`\n✨ Server ready on http://localhost:${port}`);
    console.log(`   Mode: ${dev ? "development" : "production"}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
