import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket2(roomId?:string) {
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
const  socket= io("http://localhost:3001/bot"); // Connect to current origin
socketRef.current=socket;

socket.on("connect",()=>{
  if(roomId){
    socket.emit("join-room",roomId);
    console.log("Joined Room:",roomId)
  }
})
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return socketRef;
}
