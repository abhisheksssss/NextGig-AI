"use client"
import { ChatRoom } from '@/Component/subComponents/chat';
import GetBack from '@/Component/subComponents/getBack';
import { IClient, Ifreelancer, IUser, useUser } from '@/context/user';
import { getAllUsers } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import SubLoader from "@/Component/subLoader"
function Chat(){

  const {user}=useUser();
  const [otherUser,setOtherUser]=useState({
    username:"",
    userRole:"",
    otherUserId:""
  });
  const roomId=[(user as Ifreelancer | IClient)?.userId,otherUser.otherUserId].sort().join("_")

const {data,isLoading,isError,error}=useQuery(
  {
    queryKey: ['chatRoom'],
    queryFn: getAllUsers,
      staleTime: 1000 * 60 * 5,        // 5 minutes "fresh"
    refetchOnMount: false,            // don't refetch on remount
    refetchOnWindowFocus: false,      // ignore tab focus
    refetchOnReconnect: false,
  }
)





console.log(data)




  return (
<div className="h-screen flex flex-col bg-background text-foreground">
  {/* Header */}
  <div className="h-[10%] px-4 pt-4">
    <GetBack />
  </div>

  {/* Main Chat + Users Section */}
  <div className="flex flex-1 flex-col md:flex-row gap-6 px-4 md:px-8 pb-4 mt-2 rounded-xl overflow-hidden">
    
    {/* Chat Section */}
    <div className="md:w-3/5 w-full md:h-full h-[70%] bg-muted/10 border border-muted rounded-2xl shadow-sm overflow-hidden ">
      <ChatRoom
        currentUserId={(user as Ifreelancer | IClient)?.userId || null}
        roomId={roomId}
        username={otherUser.username}
        userRole={otherUser.userRole}
        anohterUserId={otherUser.otherUserId}
      />
    </div>

    {/* User List Section */}
    <div className="md:w-2/5 w-full md:h-full h-[30%] bg-muted/10 border border-muted rounded-2xl shadow-sm overflow-y-auto p-4 space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
        <SubLoader />
           </div>
      ) : isError ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        data &&
        data.map((val: IUser, i: number) => (
          <div
            key={i}
            onClick={() => setOtherUser({
              otherUserId: val?._id,
             username:val.name,
             userRole:val.role
              
            })}
            className="cursor-pointer border border-foreground/20 bg-background hover:bg-muted transition-all rounded-xl p-4 shadow-sm flex flex-col gap-1"
          >
            <p className="font-semibold text-foreground">{val.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{val.email}</p>
          </div>
        ))
      )}
    </div>
  </div>
</div>

  )
}

export default Chat