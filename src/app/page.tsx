"use client"





import Main from "@/Component/Main";
import {Header }from "@/Component/Header";






export default function Home() {



  return (
    <>
        <div className="relative  ">
    <div className=" fixed z-10 w-full ">
    <Header />
    </div>
      <div className="w-full absolute ">
        <div className="w-full ">
          <Main/>
        </div>
      </div>
    
  </div>
      
      </>

  );
}
