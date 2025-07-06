"use client"

import { Header } from "@/Component/Header";
import Main from "@/Component/Main";



export default function Home() {



  return (
    <>
        <div className="relative w-screen">
    <div className="absolute z-10 w-full ">
    <Header />
    </div>
      <div>
        <div>
          <Main/>
        </div>
        <div></div>
      </div>
    
  </div>
      
      </>

  );
}
