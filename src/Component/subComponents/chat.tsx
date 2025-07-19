import useSocket from "@/hooks/useSocket";
import Image from "next/image";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import avatar from "@/public/avatar.png";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllMessage } from "@/lib/api";
import { useUser } from "@/context/user";
import SubLoader from "../subLoader";

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
  const socketRef = useSocket(roomId);
  const [messages, setMessages] = useState<
    {roomId:string ,text: string; from: string; ts: number }[]
  >([]);
  const [text, setText] = useState("");

  const buttonRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["messages", currentUserId, anohterUserId],
    queryFn: () => getAllMessage(currentUserId, anohterUserId),
    enabled: !!currentUserId && !!anohterUserId,
  });

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
    <div className="w-full h-full flex flex-col bg-background rounded-xl shadow-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-muted">
        <Image
          src={avatar}
          alt="username"
          height={50}
          width={50}
          className="rounded-full object-cover border border-muted shadow-sm"
        />
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-foreground">
            {username || "Username"}
          </h2>
          <p className="text-sm text-muted-foreground">{userRole || "Role"}</p>
          <p className="text-xs text-muted-foreground">{roomId}</p>
        </div>
      </div>

      {/* Chat messages */}
<div className="flex-1 h-full overflow-y-auto hide-scrollbar p-4 space-y-4 bg-muted/10">
  {isLoading ? (
    <div className="flex items-center justify-center h-full">
 <SubLoader />
    </div>
   
  ) : (
    <>
      {data &&
        data.map((m, i: number) => (
          <div
            key={`db-${i}`}
            className={`max-w-xs md:max-w-sm rounded-xl px-4 py-2 text-sm shadow ${
              m.sender._id === currentUserId
                ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                : "mr-auto bg-secondary text-secondary-foreground rounded-bl-none"
            }`}
          >
            <div className="text-xs font-semibold mb-1">
              {m.sender._id === currentUserId ? user?.name : m.sender.name}
            </div>
            <p>{m.text}</p>
            <p className="text-[10px] mt-1 text-muted-foreground text-right">
              {m.timestamp}
            </p>
          </div>
        ))}

      {messages &&
        messages.map((m, i: number) =>
          m.roomId === roomId ? (
            <div
              key={`socket-${i}`}
              className={`max-w-xs md:max-w-sm rounded-xl px-4 py-2 text-sm shadow ${
                m.from === currentUserId
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                  : "mr-auto bg-secondary text-secondary-foreground rounded-bl-none"
              }`}
            >
              <div className="text-xs font-semibold mb-1">
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
  )
  
  }
</div>
   

      {/* Input box */}
      <div className="flex items-center border-t border-muted px-2 md:px-4 py-3 gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border border-muted rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button
          onClick={send}
          className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full transition"
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
