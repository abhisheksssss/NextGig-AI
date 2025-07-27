"use client"
import Loader from '@/Component/loader';
import GetBack from '@/Component/subComponents/getBack';
import { Ifreelancer, useUser } from '@/context/user';
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';
const ApplicationPages = () => {

const{user,getUser}=useUser();
const router=useRouter();


useEffect(()=>{
    getUser()
},[user])

function timeAgo(dataString:string):string{
const now=new Date();
const date=new Date(dataString)
const second= Math.floor((now.getTime()-date.getTime())/1000)


const rtf = new Intl.RelativeTimeFormat("en",{numeric:"auto"})

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds: unitSeconds } of units) {
    const value = Math.floor(second / unitSeconds);
    if (value >= 1) return rtf.format(-value, unit);
  }

  return 'just now';


}




if(!user){
    return <div className='flex items-center justify-center w-screen h-screen'>
        <Loader></Loader>
    </div>
}

  return (
    <div className='w-screen h-screen'>
<div>
    <GetBack/>
</div>
<div className='border-2 rounded-xl container mx-auto max-h-[85%] h-[85%] mt-5 overflow-y-auto'>
  <h3 className='font-bold text-xl pl-5 pt-2'>You have applied for these Jobs</h3>
{
 user.role==="Freelancer"?    
 (
    (user as Ifreelancer).appliedFor.map((m,idx)=>(
        <div key={idx} onClick={()=>{router.push(`apply/${m._id}`)}} className='m-4 p-4 border-2 cursor-pointer shadow-xl rounded-2xl flex flex-col gap-2 dark:bg-gray-900 '>
             <h2 className='font-bold text-lg'>{m.title}</h2>
             <p className='line-clamp-3 mt-1 text-sm'>{m.description}</p>
             <p className='text-sm dark:text-gray-400 mt-1'>Budget:-{m.budget}$</p>
             <div className='flex gap-2 text-sm text-gray-400 mt-1'>{m.skills.slice(0,5).map((m,idx)=>(
                <div key={idx} className='border-2 rounded-xl p-1 px-2 dark:bg-gray-500 dark:text-black'>
            {m}
               </div>
             ))}</div>
             <p className='dark:text-gray-200'>Applied: {timeAgo(m.updatedAt)}</p>
             <p></p>
        </div>
    ))
 )
 :(
    <div className='flex items-center justify-center w-screen h-screen'>
        <p>You are not allowded to axis this page</p>
    </div>
  )
}
</div>
    </div>
  )
}

export default ApplicationPages