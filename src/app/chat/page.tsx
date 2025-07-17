"use client"
import React, { useEffect } from 'react'
import useSocket from '@/hooks/useSocket'
import GetBack from '@/Component/subComponents/getBack';


const Chat = () => {
const socketRef=useSocket()



 useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.emit("message", "Hello from frontend!");

    socketRef.current.on("message", (data) => {
      console.log("📥 Server response:", data);
    });
  }, [socketRef]);

  return (
    <div>
      <div>
       < GetBack/>
      </div>
      <div>
        <div>chat divisom</div>
        <div>Recent peoples you chat with divison</div>
      </div>
    </div>
  )
}

export default Chat