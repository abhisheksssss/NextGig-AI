"use client"
import Loader from '@/Component/loader';
import GetBack from '@/Component/subComponents/getBack';
import { useUser } from '@/context/user';
import { fetchContacts } from '@/lib/api';
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation';
import React from 'react'

// [Keep all your existing interfaces as they are]
interface ContactDetails {
  email: string;
  phone: string;
}

export interface ClientReference {
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

 export interface FreelancerReference {
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

export interface JobReference {
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

export interface ProjectContract {
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

export const CreatedContact = () => {
  const { user } = useUser();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['fetchContactDetails', user?._id],
    queryFn: () => {
      if (user?._id && user?.role) {
        return fetchContacts(user?._id, user?.role)
      }
    },
    enabled: !!user?._id,
  });

  if (isLoading || !user) {
    return (
      <div className='flex items-center justify-center w-screen h-screen'>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex items-center justify-center w-screen h-screen'>
        <p>Internal server Error</p>
      </div>
    )
  }

  return (
    <div className='w-screen h-screen'>
      <div>
        <GetBack />
      </div>
      
      <div className='container mx-auto max-h-[85%] h-[85%] mt-5 overflow-y-auto px-4'>
        <h3 className='font-bold text-2xl mb-6 text-gray-800 dark:text-white'>My Contracts</h3>
        
        <div className='space-y-4'>
          {data?.map((contract: ProjectContract) => (
            <div
              key={contract._id}
              onClick={() => { router.push(`../createdContact/${contract._id}`) }}
              className='p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700'
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className='font-semibold text-lg text-gray-900 dark:text-white'>
                  {contract.jobId.title}
                </h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  contract.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  contract.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {contract.status}
                </span>
              </div>
              
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                {user.role === "Freelancer" ? 
                  `Client: ${contract.clientId.name}` : 
                  `Freelancer: ${contract.freelancerId.name}`
                }
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <span className='font-medium text-green-600 dark:text-green-400'>
                  Budget: ${contract.jobId.budget}
                </span>
                <span className='text-gray-500 dark:text-gray-400'>
                  {new Date(contract.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CreatedContact
