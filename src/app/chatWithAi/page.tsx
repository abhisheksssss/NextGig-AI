"use client"
import GetBack from '@/Component/subComponents/getBack';
import { IClient, Ifreelancer, useUser } from '@/context/user';
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import {useSocket2} from "@/hooks/userSocket2"
import { Send } from 'lucide-react';

interface IChat{
  roomId:string;
  userId: string;
  aiResponse:string
}

 interface IChat2{
  roomId:string;
  userId:string;
  query:string;
 }

const ChatWithAi = () => {

  const {socketRef}=useSocket2()
const {user}=useUser();

const [query,setQuery]=useState("")
const [messages, setMessages] = useState<
    {roomId:string, airesp: string, userId:string|null }[]
  >([]);
const roomId=`bot_${(user as Ifreelancer | IClient)?.userId}`
useEffect(()=>{

  const socket=socketRef.current;

  if(!socket)return;
const handleMessage=(msg:{ roomId:string; airesp: string; userId:string |null })=>{
    setMessages((prev) => [...prev, msg]);
}
socket.on("message",handleMessage)
setMessages([])

return ()=>{
  socket.off("message",handleMessage)
}
},[roomId])

const send=()=>{
if(query.trim() && (user as Ifreelancer | IClient)?.userId  ){
socketRef.current?.emit("message",{
  roomId:roomId,
  userId:(user as Ifreelancer | IClient)?.userId,
  query:query
})
}
setQuery("")
}

  return (
    <div>
      {
        (user as Ifreelancer | IClient)?.userId ?
        (
<>
     <div>
      <GetBack/>
     </div>
  <div >
     <div className=''>
      <div></div>
     </div>
     <div className="flex items-center border-t border-muted px-4 py-3 gap-3 bg-background" >
      <input
       type="text"
       value={query}
       onChange={(e) => setQuery(e.target.value)}
       onKeyDown={(e)=>e.key==="Enter" && send()}
       placeholder='ask Our Ai' 
       className="flex-1 border border-muted rounded-full px-4 py-2 text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
         />
         <button
         onClick={send}
          className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full transition duration-150 shadow-sm">
            <Send className="h-5 w-5" />
         </button>
      </div> 
  </div>

</>
        ):(
          <div>
            Loading...
          </div>
        )
      }
        
        
    </div>
  )
}

export default ChatWithAi