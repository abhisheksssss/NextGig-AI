"use client"

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const GetBack = () => {
    const router= useRouter()
  return (
    <div className='w- full  pt-3 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mx-5 px-5 border-b-2 pb-2 '>
      <div className='flex items-center gap-2'
      
      onClick={()=>{
router.push("/")
      }}>


         <ChevronLeft />
      <h1 className='font-bold text-xl'>Back</h1>
        </div>
    </div>
    
  )
}

export default GetBack