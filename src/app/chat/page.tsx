"use client"
import { ChatRoom } from '@/Component/subComponents/chat';
import GetBack from '@/Component/subComponents/getBack';
import { IClient, Ifreelancer, IUser, useUser } from '@/context/user';
import { getAllUsers } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import SubLoader from "@/Component/subLoader"
import { MessageCircle, Users, Search } from 'lucide-react';

function Chat() {
  const { user } = useUser();
  const [otherUser, setOtherUser] = useState({
    username: "",
    userRole: "",
    otherUserId: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  const roomId = [(user as Ifreelancer | IClient)?.userId, otherUser.otherUserId].sort().join("_");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['chatRoom'],
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredUsers = data?.[0]?.chatWith?.filter((val: IUser) =>
    val.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    val.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <GetBack />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
          </div>
        </div>
      </div>

      {/* Main Content - Fixed height with proper overflow */}
      <div className="flex-1 min-h-0 p-4 md:p-6 lg:p-8">
        <div className="h-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* User List Sidebar - Fixed with proper scroll */}
          <div className="lg:col-span-1 h-full min-h-0 flex flex-col">
            <div className="h-full min-h-0 bg-card border border-border/50 rounded-3xl shadow-xl flex flex-col overflow-hidden">
              {/* Sidebar Header - Fixed */}
              <div className="flex-shrink-0 p-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">Conversations</h2>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* User List - Scrollable area with proper overflow */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <SubLoader />
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <p className="text-sm font-medium text-destructive mb-1">Unable to load conversations</p>
                    <p className="text-xs text-muted-foreground">{error.message}</p>
                  </div>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.slice().reverse().map((val: IUser, i: number) => (
                    <button
                      key={i}
                      onClick={() =>
                        setOtherUser({
                          otherUserId: val?._id,
                          username: val.name,
                          userRole: val.role,
                        })
                      }
                      className={`w-full group relative rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        otherUser.otherUserId === val?._id
                          ? 'bg-primary/10 border-primary/50 shadow-md'
                          : 'bg-card/50 border-border/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg uppercase ring-2 ring-primary/20">
                            {val.name?.charAt(0)}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-card" />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {val.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{val.email}</p>
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground capitalize">
                            {val.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                      <MessageCircle className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">No conversations yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery ? 'No users match your search' : 'Add users to start chatting'}
                    </p>
                    {!searchQuery && (
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                        Find Users
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Window - Fixed with proper overflow */}
          <div className="lg:col-span-2 h-full min-h-0">
            <div className="h-full bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden">
              {otherUser.otherUserId ? (
                <ChatRoom
                  currentUserId={(user as Ifreelancer | IClient)?.userId || null}
                  roomId={roomId}
                  username={otherUser.username}
                  userRole={otherUser.userRole}
                  anohterUserId={otherUser.otherUserId}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <MessageCircle className="w-12 h-12 text-primary/50" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Welcome to Messages
                  </h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Select a conversation from the sidebar to start chatting with your connections
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <div className="px-4 py-2 bg-muted/50 rounded-full text-xs text-muted-foreground">
                      💬 Real-time messaging
                    </div>
                    <div className="px-4 py-2 bg-muted/50 rounded-full text-xs text-muted-foreground">
                      🔒 Secure & private
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
