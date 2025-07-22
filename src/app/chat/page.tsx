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
                                       // don't refetch on remount
    refetchOnWindowFocus: false,      // ignore tab focus
    refetchOnReconnect: false,
  }
)
if(data){
console.log("This is the data we get",data[0]?.chatWith.slice().reverse())

}

  return (
<div className="h-screen flex flex-col bg-background text-foreground">
  {/* Header */}
  <div className="h-[10%] px-4">
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
        data && data[0]?.chatWith?.length!==0  ?  

        data[0].chatWith.slice().reverse().map((val: IUser, i: number) => (
          <div
  key={i}
  tabIndex={0}
  onClick={() =>
    setOtherUser({
      otherUserId: val?._id,
      username: val.name,
      userRole: val.role,
    })
  }
  className="group cursor-pointer rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
>
  <div className="flex items-center gap-3">
    {/* Optional Avatar Placeholder */}
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg uppercase">
      {val.name?.charAt(0)}
    </div>
    <div className="flex-1">
      <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {val.name}
      </p>
      <p className="text-sm text-muted-foreground">{val.email}</p>
    </div>
  </div>

  {/* Optional role badge */}
  <div className="mt-3 inline-block rounded-full bg-secondary text-secondary-foreground text-xs px-3 py-1 capitalize">
    {val.role}
  </div>
</div>
        )):
        <div className='flex items-center justify-center h-full'>
          No user Founded Add User to Start Chat
        </div>
      )}
    </div>
  </div>
</div>

  )
}

export default Chat