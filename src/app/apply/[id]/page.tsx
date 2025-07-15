"use client"

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation'
import {fetchJob} from '@/lib/api'
import GetBack from '@/Component/subComponents/getBack';
import Image from 'next/image';
import { MessageCircleMore, Send } from 'lucide-react';

interface ContactDetails {
  email: string;
  phone: string;
}

interface JobData {
  _id: string;
  title: string;
  clientId:{
    profilePicture:string;
    Bio:string,
    email: string;
    Field:string[];
    name:string;
    role:string;
    company:string;
    contactdetails:{
        email: string;
        phone: string;
    };
    
ContactPreference:string;

  };
  description: string;
  budget: number;
  skills: string[];
  status: boolean;
  createdAt: string;
  location: string;
  profilePicture: string;
  name: string;
  role: string;
  company: string;
  Field: string[];
  Bio: string;
  ContactPreference: string;
  contactdetails: ContactDetails;
}

const ApplyForJob = () => {
  const {id} = useParams();

  const {data, isLoading, isError, error} = useQuery<JobData, Error>({
    queryKey: ['job', id ?? null],
    queryFn: () => fetchJob(id ? id.toString() : null)
  })
console.log("THis is data we get",data)

if(isError){
    return <div>Error: {error.message}</div>
}

return (
    <div className='w-full max-w-full overflow-x-hidden custom-scrollbar'>
        <div className='px-4'>
            <GetBack/>
        </div>
        <div className='h-full w-full custom-scrollbar'>
{
    isLoading?(
        <div className='flex justify-center items-center min-h-[200px]'>
            <div className='text-lg'>Loading...</div>
        </div>
    ):(
        <div className='px-4 md:px-6 flex flex-col md:flex-row gap-6 max-w-[1400px] mx-auto'>
            {/* Job Details Section */}
            <div className='w-full md:w-2/3 space-y-6'>
              <div className='bg-background rounded-xl p-6 shadow-lg border border-accent/20 custom-scrollbar'>
                <h1 className='text-2xl font-semibold mb-2'>{data?.title}</h1>
                <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
                  <span>Posted on {new Date(data?.createdAt || '').toLocaleDateString()}</span>
                  {data?.status ? (
                    <span className='flex items-center gap-1'>
                      • <span className='h-2 w-2 bg-green-500 rounded-full inline-block'></span> Active
                    </span>
                  ) : (
                    <span className='flex items-center gap-1'>
                      • <span className='h-2 w-2 bg-red-500 rounded-full inline-block'></span> Not Active
                    </span>
                  )}
                </div>

                <div className='space-y-6'>
                  <div>
                    <h2 className='text-lg font-semibold mb-2'>Description</h2>
                    <p className='text-foreground/80 whitespace-pre-wrap'>{data?.description}</p>
                  </div>

                  <div>
                    <h2 className='text-lg font-semibold mb-2'>Required Skills</h2>
                    <div className='flex flex-wrap gap-2'>
                      {data?.skills?.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className='px-3 py-1 text-sm font-medium bg-accent text-foreground rounded-full'
                        >
                          {skill}
                        </span>
                      )) || 'No skills specified'}
                    </div>
                  </div>

                  <div>
                    <h2 className='text-lg font-semibold mb-2'>Budget</h2>
                    <p className='text-foreground/80'>${data?.budget}</p>
                  </div>

                  <div>
                    <h2 className='text-lg font-semibold mb-2'>Location</h2>
                    <p className='text-foreground/80'>{data?.location}</p>
                  </div>
                </div>

                <div className='mt-8'>
                  <button className='w-full py-3 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'>
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Client Details Section */}
            <div className='w-full md:w-1/3'>
              <div className='bg-background rounded-xl p-6 shadow-lg border border-accent/20 sticky top-6'>
                <div className='flex items-center gap-4 mb-6'>
                  <div className='relative w-16 h-16'>
                    <Image 
                      src={data?.clientId?.profilePicture || ''} 
                      alt={data?.clientId?.name || ''}
                      fill
                      className='rounded-full object-cover border-2 border-accent'
                    />
                  </div>
                  <div>
                    <h2 className='font-semibold text-lg'>{data?.clientId.name}</h2>
                    <p className='text-sm text-muted-foreground'>{data?.clientId.role}</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-1'>Company</h3>
                    <p className='font-medium'>{data?.clientId.company}</p>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-1'>Field</h3>
                    <div className='flex flex-wrap gap-2'>
                      {data?.clientId.Field?.map((field: string, index: number) => (
                        <span
                          key={index}
                          className='px-2 py-1 text-xs bg-accent/50 text-foreground rounded-md'
                        >
                          {field}
                        </span>
                      )) || 'No fields specified'}
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-1'>About</h3>
                    <p className='text-sm text-foreground/80'>{data?.clientId?.Bio}</p>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-1'>Contact Preference</h3>
                    <p className='text-sm'>{data?.clientId.ContactPreference}</p>
                  </div>

                  {data?.clientId.ContactPreference === 'Email' && (
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>Email</h3>
                      <p className='text-sm'>{data?.clientId.contactdetails.email}</p>
                    </div>
                    
                  )}

                  {data?.clientId.ContactPreference === 'Phone' && (
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>Phone</h3>
                      <p className='text-sm'>{data?.clientId?.contactdetails.phone}</p>
                    </div>
                  )}

                </div>
     <div className='flex justify-between items-center mt-4 gap-10'>
               
  <button className='w-full flex items-center justify-center gap-2 py-3 mt-4 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'>
                <MessageCircleMore />   <p>send message</p>   
                  </button>
  <button className='w-full flex items-center justify-center gap-2 py-3 mt-4 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'>
               <Send />    <p>send Email</p> 
                  </button>
       
     </div>

              </div>
            </div>
          </div>
    )
}
        </div>
    </div>
  )
}

export default ApplyForJob