"use client"

import { Header } from "@/Component/Header";
import Main from "@/Component/Main";



export default function Home() {



  return (
    <>
        <div className="relative ">
    <div className=" fixed z-10 w-full ">
    <Header />
    </div>
      <div className="w-full absolute">
        <div className="w-full">
          <Main/>
        </div>
        <div></div>
      </div>
    
  </div>
      
      </>

  );
}
