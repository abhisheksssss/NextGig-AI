"use client"
import { ChatRoom } from '@/Component/subComponents/chat';
import GetBack from '@/Component/subComponents/getBack';
import { IClient, Ifreelancer, IUser, useUser } from '@/context/user';
import { getAllUsers } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import SubLoader from "@/Component/subLoader"
import { MessageCircle, Users, Search, ChevronLeft } from 'lucide-react';

function Chat() {
  const { user } = useUser();
  const [otherUser, setOtherUser] = useState({
    username: "",
    userRole: "",
    otherUserId: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle

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

  const handleSelectUser = (val: IUser) => {
    setOtherUser({
      otherUserId: val?._id,
      username: val.name,
      userRole: val.role,
    });
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Fixed Header - Responsive */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-xl border-b border-border/50 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <GetBack />
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden xs:inline">Messages</span>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive grid */}
      <div className="flex-1 min-h-0 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="h-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          
          {/* User List Sidebar - Mobile overlay + responsive */}
          <div className={`md:col-span-1 h-full min-h-0 flex flex-col ${
            sidebarOpen ? 'fixed inset-0 z-50 md:static p-3 sm:p-4' : 'hidden md:flex'
          }`}>
            {/* Mobile sidebar close button */}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <div className="h-full min-h-0 bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden">
              {/* Sidebar Header - Responsive */}
              <div className="flex-shrink-0 p-3 sm:p-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                  <h2 className="font-semibold text-base sm:text-lg truncate">Conversations</h2>
                </div>
                
                {/* Search Bar - Responsive */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-background/50 border border-border/50 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* User List - Scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <SubLoader />
                  </div>
                ) : isError ? (
                  <div className="flex flex-col items-center justify-center h-full px-3 sm:px-4 text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-3 sm:mb-4">
                      <MessageCircle className="w-6 sm:w-8 h-6 sm:h-8 text-destructive" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-destructive mb-1">Unable to load conversations</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{error.message}</p>
                  </div>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.slice().reverse().map((val: IUser, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSelectUser(val)}
                      className={`w-full group relative rounded-lg sm:rounded-2xl border transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        otherUser.otherUserId === val?._id
                          ? 'bg-primary/10 border-primary/50 shadow-md'
                          : 'bg-card/50 border-border/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-sm sm:text-lg uppercase ring-2 ring-primary/20">
                            {val.name?.charAt(0)}
                          </div>
                          <div className="absolute bottom-0 right-0 w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 bg-green-500 rounded-full ring-2 ring-card" />
                        </div>

                        {/* User Info - Truncated on mobile */}
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {val.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{val.email}</p>
                          <span className="inline-block mt-1 text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground capitalize">
                            {val.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-muted/30 flex items-center justify-center mb-3 sm:mb-4">
                      <MessageCircle className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-2">No conversations yet</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      {searchQuery ? 'No users match your search' : 'Add users to start chatting'}
                    </p>
                    {!searchQuery && (
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors">
                        Find Users
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Window - Responsive */}
          <div className="md:col-span-2 h-full min-h-0 flex flex-col">
            <div className="h-full bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col">
              {otherUser.otherUserId ? (
                <>
                  {/* Mobile chat header with sidebar toggle */}
                  <div className="md:hidden flex-shrink-0 flex items-center justify-between border-b border-border/50 px-3 py-2 bg-muted/20">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Conversations
                    </button>
                    <h3 className="text-sm font-semibold truncate flex-1 text-center px-2">
                      {otherUser.username}
                    </h3>
                  </div>
                  <ChatRoom
                    currentUserId={(user as Ifreelancer | IClient)?.userId || null}
                    roomId={roomId}
                    username={otherUser.username}
                    userRole={otherUser.userRole}
                    anohterUserId={otherUser.otherUserId}
                  />
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <MessageCircle className="w-8 sm:w-12 h-8 sm:h-12 text-primary/50" />
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Welcome to Messages
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-md mb-4 sm:mb-6">
                    {sidebarOpen ? 'Select a conversation to start chatting' : 'Open conversations to start chatting'}
                  </p>
                  {/* Show button on mobile to open sidebar */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Open Conversations
                  </button>
                  <div className="hidden md:flex flex-wrap gap-2 sm:gap-3 justify-center">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-muted/50 rounded-full text-[10px] sm:text-xs text-muted-foreground">
                      💬 Real-time messaging
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
