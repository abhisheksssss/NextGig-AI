import useSocket from "@/hooks/useSocket";
import Image from "next/image";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import avatar from "@/public/avatar.png";
import { Send, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteChat, getAllMessage } from "@/lib/api";
import { useUser } from "@/context/user";
import SubLoader from "../subLoader";


export interface IChat{
  _id:string;
  text: string;
  sender: {
    _id: string;
    name: string;
  };
  receiver: string;
  read:boolean;
timestamp:string
}

export function ChatRoom({
  roomId,
  currentUserId,
  anohterUserId,
  username,
  userRole,
}: {
  roomId: string;
  currentUserId: string | null;
  username: string | null;
  userRole: string | null;
  anohterUserId: string | null;
}) {
  const { user } = useUser();
  const queryClient =useQueryClient();

  const socketRef = useSocket(roomId);
  const [messages, setMessages] = useState<
    {roomId:string ,text: string; from: string; ts: number }[]
  >([]);
  const [text, setText] = useState("");
  const [deletingChatId,setDeletingChatId]=useState<string|null>(null)


  const buttonRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading} = useQuery({
    queryKey: ["messages", currentUserId, anohterUserId],
    queryFn: () => getAllMessage(currentUserId, anohterUserId),
    enabled: !!currentUserId && !!anohterUserId,
  });

  const {mutate:deleteChatMutation}=useMutation({
mutationFn:()=>deleteChat(deletingChatId),
onSuccess:(data)=>{
  queryClient.invalidateQueries({queryKey:["messages"]})
  setDeletingChatId(null)
 }
})

  console.log(data);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (msg: {roomId:string; text: string; from: string; ts: number }) => {
      console.log(msg);
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("message", handleMessage);
setMessages([])
    return () => {
      socket.off("message", handleMessage);
    };
  }, [roomId]);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      buttonRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 30);
    return () => clearTimeout(timeout);
  }, [messages]);

  useEffect(() => {
    if (data) {
      const timeout = setTimeout(() => {
        buttonRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [data]);

  const send = () => {
    if (text.trim() && currentUserId) {
      socketRef.current?.emit("message", {
        roomId,
        text,
        from: currentUserId,
        to: anohterUserId,
      });
      setText("");
    }
  };



  return anohterUserId ? (
    <div className="w-full h-full flex flex-col bg-background rounded-2xl shadow-xl border border-border overflow-hidden">

  {/* 🧠 Header */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-muted bg-muted/40">
 <div className="flex items-center gap-5">
   <Image
      src={avatar}
      alt="username"
      height={48}
      width={48}
      className="rounded-full object-cover border border-muted shadow"
    />
    <div className="flex flex-col gap-0.5">
      <h2 className="text-base font-semibold text-foreground">{username || "Username"}</h2>
      <p className="text-sm text-muted-foreground capitalize">{userRole || "Role"}</p>
      {/* <p className="text-xs text-muted-foreground">{roomId}</p> */}
    </div>
  </div>  

  <div >
   { deletingChatId && <Trash className="hover:text-red-600"  onClick={()=>deleteChatMutation()}/>}
  </div>
  </div>

  {/* 💬 Chat Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 hide-scrollbar scroll-smooth">
    {isLoading ? (
      <div className="flex justify-center items-center h-full">
        <SubLoader />
      </div>
    ) : (
      <>
        {data?.map((m:IChat, i:number) => (
          <div
            key={`db-${i}`}
            onDoubleClick={()=>  m.sender._id === currentUserId &&  setDeletingChatId(m._id)}
            className={`max-w-[75%] md:max-w-sm px-4 py-3 rounded-2xl text-sm shadow-md transition ${deletingChatId === m._id ? "bg-red-700" : ""} ${
              m.sender._id === currentUserId
                ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                : "mr-auto bg-secondary text-secondary-foreground rounded-bl-none"
            }`}
          >
            <div className="text-xs font-semibold mb-1 opacity-90">
              {m.sender._id === currentUserId ?<p>{ user?.name}  (You)</p> : m.sender.name}
            </div>
            <p>{m.text}</p>
            <p className="text-[10px] mt-1 text-muted-foreground text-right">
              {  
             new Date( m.timestamp).toLocaleString()
              }
            </p>
          </div>
        ))}

        {messages?.map((m, i) =>
          m.roomId === roomId ? (
            <div
              key={`socket-${i}`}
              className={`max-w-[75%] md:max-w-sm px-4 py-3 rounded-2xl text-sm shadow-md transition ${
                m.from === currentUserId
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                  : "mr-auto bg-secondary text-secondary-foreground rounded-bl-none"
              }`}
            >
              <div className="text-xs font-semibold mb-1 opacity-90">
                {m.from === currentUserId ? user?.name : username}
              </div>
              <p>{m.text}</p>
              <p className="text-[10px] mt-1 text-muted-foreground text-right">
                {new Date(m.ts).toLocaleTimeString()}
              </p>
            </div>
          ) : null
        )}

        <div ref={buttonRef} />
      </>
    )}
  </div>

  {/* 📝 Input Box */}
  <div className="flex items-center border-t border-muted px-4 py-3 gap-3 bg-background">
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && send()}
      placeholder="Type your message..."
      className="flex-1 border border-muted rounded-full px-4 py-2 text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
    />
    <button
      onClick={send}
      className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full transition duration-150 shadow-sm"
    >
      <Send className="h-5 w-5" />
    </button>
  </div>

</div>

  ) : (
    <div className="w-full h-full flex flex-col justify-center items-center font-bold">
      No chat founded
    </div>
  );
}
