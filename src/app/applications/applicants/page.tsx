"use client"
import Loader from '@/Component/loader'
import GetBack from '@/Component/subComponents/getBack'
import { IClient, useUser } from '@/context/user'
import { getApplicants } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

 interface Applicant {
  Availability: string;
  Bio: string;
  ContactPreference: string;
  Experience: number;
  HourlyRate: number;
  Portfolio: string[];
  Proffession: string;
  Skills: string[];
  contactdetails: {
    email: string;
    phone: string;
  };
  createdAt: string;
  email: string;
  languages: string[];
  location: string;
  name: string;
  onBoarding: boolean;
  profilePicture: string;
  profileVisibility: string;
  resumePdf: string;
  role: string;
  updatedAt: string;
  userId: string;
  _id: string;
  __v: number;
}


const Applicants = () => {
const{user}=useUser()
const router=useRouter()

 const {data:applicants} = useQuery({
    queryKey: ['fetchJobData'],
    queryFn: getApplicants
  })

console.log(applicants)

if(!applicants || !user){
    return (
        <div className='flex w-screen h-screen justify-center items-center'>
<Loader/>
        </div>
    )
}

  return (

    <div className='w-screen h-screen'>
<div>
    <GetBack/>
</div>
<div className='border-2 rounded-xl container mx-auto max-h-[85%] h-[85%] mt-5 overflow-y-auto'>
  <h3 className='font-bold text-xl pl-5 pt-2'>Posted Jobs</h3>
{
 user?.role==="Client"?    
 (
applicants.map((m,idx:number)=>(
       <div key={idx} onClick={()=>{router.push(`getParticularJob/${m._id}`)}} className='m-4 p-4 border-2 cursor-pointer shadow-xl rounded-2xl flex flex-col gap-2 dark:bg-gray-900 '>
             <h2 className='font-bold text-lg'>{m.title}</h2>
             <p className='line-clamp-3 mt-1 text-sm'>{m.description}</p>
             <p className='text-sm dark:text-gray-400 mt-1'>Budget:-{m.budget}$</p>
             <div className='flex gap-2 text-sm text-gray-400 mt-1'>{m.skills.slice(0,5).map((m,idx:number)=>(
                <div key={idx} className='border-2 rounded-xl p-1 px-2 dark:bg-gray-500 dark:text-black'>
            {m}
               </div>
             ))}</div>
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


//    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
//      <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Recent Applicants</h3>
//      <div className="space-y-5 overflow-y-auto max-h-[400px]">
//        {Array.isArray(applicants) && applicants.every(job => job.applicants.length === 0) ? (
//          <div className="text-center text-gray-500 dark:text-gray-400">
//            No applicants found.
//          </div>
//        ) : (
//          Array.isArray(applicants) &&
//          applicants.map((job, i:number) => (
//            job.applicants.length > 0 && (
//              <div
//                key={i}
//                className="pb-4 border-2 p-5 rounded-xl border-gray-100 dark:border-gray-700"
//              >
//                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
//                  Job Title: <span className="font-medium">{job.title}</span>
//                </p>
//                {job.applicants.slice(0,2).map((applicant:Applicant, idx:number) => (
//                  <div key={idx} className="flex items-center cursor-pointer gap-4 mb-3">
//                    <div className="w-12 h-12 bg-gray-200  dark:bg-gray-700 rounded-full">
//                      <Image
//                        src={applicant.profilePicture}
//                        alt={applicant.name}
//                        width={50}
//                        height={50}
//                        className='rounded-full object-cover'
//                      />
//                    </div>
//                    <div>
//                      <h4 className="font-semibold text-gray-900 dark:text-white">
//                        {applicant.name}
//                      </h4>
//                      <p className="text-sm text-gray-500 dark:text-gray-400">
//                        {applicant.email}
//                      </p>
//                      <p className="text-sm text-gray-500 dark:text-gray-400">
//                        Applied 2h ago
//                      </p>
//                    </div>
//                  </div>
//                ))}
//              </div>
//            )
//          ))
//        )}
//      </div>
//    </div>
  )
}

export default Applicants