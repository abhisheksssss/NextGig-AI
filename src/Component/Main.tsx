import { useUser } from '@/context/user'
import React from 'react'

const Main = () => {

    const {user}=useUser();

  return (
    <div>
{
    user?(
        <div>UserAvilable</div>
    ):(
<div>
    userNotavilalbe
</div>
    )
}

    </div>
  )
}

export default Main