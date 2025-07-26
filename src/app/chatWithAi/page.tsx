"use client"
import GetBack from '@/Component/subComponents/getBack';
import { IClient, Ifreelancer, useUser } from '@/context/user';
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import useSocket2 from "@/hooks/userSocket2"
import { Send } from 'lucide-react';

interface Message {
  roomId: string;
  query: string;
  sender: string;
  aires: string | null;
}

const ChatWithAi = () => {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Memoize user data and roomId to prevent unnecessary re-renders
  const userData = useMemo(() => user as Ifreelancer | IClient, [user]);
  const roomId = useMemo(() => 
    userData?.userId ? `bot_${userData.userId}` : null, 
    [userData?.userId]
  );

  const socketRef = useSocket2(roomId!);

  useEffect(() => {
    const socket = socketRef.current;
    
    if (!socket || !roomId) return;

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("message", handleMessage);

    // Only clear messages when roomId changes (i.e., different user)
    // Remove this line if you want to persist messages across re-renders
    // setMessages([]);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [roomId]); // Only depend on roomId

  const send = useCallback(() => {
    if (!query.trim() || !userData?.userId || !socketRef.current) {
      return;
    }
     const userMessage: Message = {
    roomId: roomId!,
    query: query.trim(),
    sender: userData.userId,
    aires: null
  };
    setMessages((prev) => [...prev, userMessage]);

    socketRef.current.emit("message", {
      roomId: roomId,
      userId: userData.userId,
      query: query.trim()
    });

    setQuery("");
  }, [query, userData?.userId, roomId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }, [send]);

  // Show loading if user data is not available
  if (!userData?.userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div>
        <GetBack />
      </div>
      
      <div className=" flex flex-col justify-between h-[90%] container mx-auto">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-full border-2 rounded-xl shadow-2xl hide-scrollbar ">
          {messages.length === 0 ? (
            <div className=" text-muted-foreground flex justify-center items-center">
              Start a conversation with our AI
            </div>
          ) : (
            messages.map((message, idx) => (
              <div key={idx} className="space-y-2">
                {message.query && (
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-[80%]">
                      {message.query}
                    </div>
                  </div>
                )}
                {message.aires && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-2 rounded-lg max-w-[80%]">
                      {message.aires}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input container */}
        <div className="flex items-center border-t border-muted px-4 py-3 gap-3 bg-background">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask our AI..."
            className="flex-1 border border-muted rounded-full px-4 py-2 text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          />
          <button
            onClick={send}
            disabled={!query.trim()}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground p-2 rounded-full transition duration-150 shadow-sm"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAi;
