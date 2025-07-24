"use client"
import { IClient, Ifreelancer, useUser } from '@/context/user';
import React from 'react'
import { io } from 'socket.io-client';




const ChatWithAi = () => {
const {user}=useUser();

  const userSocket=io("http://localhost:3001/bot");
userSocket.emit("join-room","room123");
userSocket.emit("message",{roomId:"bot-room",query:"How do i ",userId:(user as Ifreelancer | IClient)?.userId})
  return (
    <div>
        hellow orld
    </div>
  )
}

export default ChatWithAi