"use client"





import Main from "@/Component/Main";
import dynamic from "next/dynamic";


const Header = dynamic(() => import('@/Component/Header').then(mod => ({ default: mod.Header })), {
  ssr:  true // or false if you don't want server-side rendering
});




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
