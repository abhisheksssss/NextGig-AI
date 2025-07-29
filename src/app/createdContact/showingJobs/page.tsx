"use client"
import Loader from '@/Component/loader';
import GetBack from '@/Component/subComponents/getBack';
import { useUser } from '@/context/user';
import { fetchContacts } from '@/lib/api';
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation';
import React from 'react'



// Contact details interface
// Contact details interface
interface ContactDetails {
  email: string;
  phone: string;
}

// Client reference interface (populated from clientId)
interface ClientReference {
  contactdetails: ContactDetails;
  _id: string;
  userId: string;
  name: string;
  email: string;
  Bio?: string;
  ContactPreference?: string;
  Field?: string[];
  company?: string;
  location?: string;
  onBoarding?: boolean;
  profilePicture?: string;
  role?: "Client";
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Freelancer reference interface (populated from freelancerId)
interface FreelancerReference {
  contactdetails: ContactDetails;
  _id: string;
  userId: string;
  name: string;
  email: string;
  Availability?: string;
  Bio?: string;
  ContactPreference?: string;
  Experience?: number;
  HourlyRate?: number;
  Portfolio?: string[];
  Proffession?: string;
  Skills?: string[];
  appliedFor?: string[];
  languages?: string[];
  location?: string;
  onBoarding?: boolean;
  profilePicture?: string;
  profileVisibility?: string;
  resumePdf?: string;
  role?: "Freelancer";
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Job reference interface (populated from jobId)
interface JobReference {
  _id: string;
  clientId: string;
  title: string;
  description: string;
  skills: string[];
  applicants?: string[];
  budget?: number;
  status?: boolean;
  isReleased?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// Main contract/project interface
interface ProjectContract {
  amount: number;
  clientId: ClientReference;
  createdAt: string;
  freelancerId: FreelancerReference;
  isReleased: boolean;
  jobId: JobReference;
  paymentIntentId: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  updatedAt: string;
  __v: number;
  _id: string;
}


const CreatedContact = () => {

const {user}=useUser();

const router=useRouter();


const { data, isLoading, isError } = useQuery({
  queryKey: ['fetchContactDetails', user?._id], // include freelancerId in queryKey
  queryFn: () => {
    if(user?._id,user?.role){
   return fetchContacts(user?._id,user?.role)}
    }  ,// correct arrow function syntax
  enabled: !!user?._id, // optional: only run query if freelancerId exists
});

console.log(data)

if(isLoading || !user){
  return (
    <div className=' flex items-center justify-center w-screeen h-screen'>
      <Loader/>
    </div>
  )
}

if(isError){
     return (
    <div className=' flex items-center justify-center w-screeen h-screen'>
      <p>Internal server Error</p>
    </div>
  )
}


  return (
       <div className='w-screen h-screen'>
<div>
    <GetBack/>
</div>
<div className='border-2 rounded-xl container mx-auto max-h-[85%] h-[85%] mt-5 overflow-y-auto'>
  <h3 className='font-bold text-xl pl-8 pt-5'>Contracts</h3>
{
 user.role==="Freelancer"?    
 (
    data.map((m:ProjectContract,idx:number)=>(
        <div key={idx} onClick={()=>{router.push(`../createdContact/${m._id}`)}} className='m-4 p-4 border-2 cursor-pointer shadow-xl rounded-2xl flex flex-col gap-2 dark:bg-gray-900 '>
             <h2 className='font-bold text-lg'>{m.jobId.title}</h2>
             <p className='line-clamp-3 mt-1 text-sm'>{m.clientId.name}</p>
             <p className='text-sm dark:text-gray-400 mt-1'>Budget:-{m.jobId.budget}$</p>
         
             <p className='dark:text-gray-200'>Contract created At : {m.createdAt.slice(0,10)} </p>
             <p></p>
        </div>
    ))
 )
 :(
     data.map((m:ProjectContract,idx:number)=>(
        <div key={idx} onClick={()=>{router.push(`../createdContact/${m._id}`)}} className='m-4 p-4 border-2 cursor-pointer shadow-xl rounded-2xl flex flex-col gap-2 dark:bg-gray-900 '>
             <h2 className='font-bold text-lg'>{m.jobId.title}</h2>
             <p className='line-clamp-3 mt-1 text-sm'>{m.freelancerId.name}</p>
             <p className='text-sm dark:text-gray-400 mt-1'>Budget:-{m.jobId.budget}$</p>
         
             <p className='dark:text-gray-200'>Contract created At : {m.createdAt.slice(0,10)} </p>
             <p></p>
        </div>
    ))
  )
}
</div>
    </div>
  )
}

export default CreatedContact