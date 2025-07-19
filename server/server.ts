import { RedisMemoryServer } from 'redis-memory-server';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { createServer } from 'http';
import express from 'express';
import next from 'next';
import { Server } from 'socket.io';
import {mongoDBConncection} from "../src/app/dbConfig/db"
import messageModel from '../src/helper/model/message.model.ts';
const redisServer = new RedisMemoryServer();

async function main() {
  const dev = process.env.NODE_ENV !== 'production';
  // Specify the directory where Next.js app is located
  const app = next({ dev, dir: './src' }); // Go up one level to the project root
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
  pubClient.on('error', (err) => console.error('❌ Redis pubClient error:', err));
  await pubClient.connect();
  
  const subClient = pubClient.duplicate();
  subClient.on('error', (err) => console.error('❌ Redis subClient error:', err)); // ✅
  await subClient.connect();
console.log(`🧠 RedisMemoryServer running at redis://${host}:${port}`);
  // Attach Socket.IO with Redis adapter
  const io = new Server(httpServer, {
    cors: { origin: dev ? 'http://localhost:3000' : undefined }
  });
  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', socket => {
    console.log('Client connected:', socket.id);
    socket.on('join-room', roomId =>{
      console.log("This is room",roomId)
      socket.join(roomId)});
    socket.on('message',async ({ roomId, text ,from ,to }) => {

      const msg = {roomId ,text, from: from, to,ts: Date.now() };
      console.log(msg)

      io.to(roomId).emit('message', msg);

// save to databse 
try {
  const message = await messageModel.create({sender:from,receiver:to,text})
  if(!message){
throw new Error("No data founded")  }
} catch (error) {
  console.log(error)
}

   });
});

expressApp.all("/*splat", (req, res) => {
  handle(req, res);
});

  httpServer.listen(3001, () => console.log('> Listening on http://localhost:3001'));
}

main().catch(console.error);