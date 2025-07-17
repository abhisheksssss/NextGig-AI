"use client"
import React, { useEffect } from 'react'
import JobCards from './JobCards'
import { useQuery } from '@tanstack/react-query'
import { fetchJobs } from '@/lib/api'
import News from './news';
import useSocket from '@/hooks/useSocket';


export interface JobPostPayload1 {
  _id:string;
  title: string;
  description: string;
  skills: string[];  // For API submission
  budget: number;
  clientId: string;
  status: boolean;
  createdAt:string;
}



const Freelancer = () => {

  const socketRef=useSocket()

const {data,isLoading,isError,error}=useQuery({
  queryKey: ['freelancer'],
  queryFn:fetchJobs,

     staleTime: 1000 * 60 * 5,          // 5 minutes “fresh”
    refetchOnMount: false,             // don’t refetch on remount
    refetchOnWindowFocus: false,       // ignore tab focus
    refetchOnReconnect: false,         // ignore network reconnect
})







console.log("THis is the data we have recieved",data)


if(isLoading)return <p>Loading Jobs....</p>

if(isError)return <p>Error :{(error as Error).message}</p>


  return (
    <div className='border-2  pt-34 sm:pt-20 px-9 sm:flex sm:gap-5'>
   <div className='sm:w-[70%]  flex flex-col gap-3'>
    <div>
      <h1 className='text-3xl font-bold'>Recomanded Jobs</h1>
    </div>
{
 data? data.data?.map((index:JobPostPayload1)=>(
  <div key={index._id}>
<JobCards  
    clientId={index.clientId} 
    description={index.description} 
    createdAt={index.createdAt} 
    title={index.title} 
    skills={index.skills} 
    status={index.status}
    _id={index._id}/>
    
  </div>  
  )):(
    <p>
      Loading.....
    </p>
  )
}
    </div>   
    <div className='w-[30%] border-2 hidden md:block rounded-xl max-h-screen overflow-y-scroll h-full sticky top-6  hide-scrollbar'>
     <News/>
    </div>
    
    </div>
  ) 
}

export default Freelancer



// model && (
//   <div className='absolute top-0 z-10 border-2 border-foreground'>
// <p>This </p>
//   </div>
// )