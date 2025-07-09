
import Link from 'next/link'
import React from 'react'

const Client = () => {
  return (
    <div className= 'absolute bg-background px-5 pt-32 sm:pt-20  w-full h-full'>
<div className='border-2 p-2 shadow-sm shadow-accent-foreground rounded-xl flex justify-end'>
<Link href="/postJob" className='text-background bg-accent-foreground p-2 rounded-md'> Post a Job</Link>
</div>
    </div>
  )
}

export default Client