"use client";

import * as React from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Logo from "@/public/image.png"; // Adjust the path to your logo image
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react"; // Optional icons
import { useUser } from "@/context/user";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
export function Header() {

  const {user}=useUser();

const logOut=async()=>{
try {
  const logOut= await axiosInstance.get("/api/auth/logOut")
  if(logOut){
    toast.success("LogOut successfully")
window.location.href="/"  
  }
} catch (error) {
  console.log(error)
}
}

const [mode,setMode]=React.useState("light");

const { setTheme } = useTheme();

  return (
    <header className="w- full  sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5">
      <div className=" w-full border-2 rounded-b-xl shadow-2xl flex flex-col sm:flex-row  justify-between items-center gap-4 py-3 border-b">
        {/* Logo or Brand - Add your logo here */}
     
     <div className="flex ">  
      
  <Image src={Logo} alt="my-image" width={50} height={50}/>

        {/* Navigation Menu */}
        <NavigationMenu className="w-full ">
          <NavigationMenuList className=" justify-center">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
            
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Find Talent</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/talent/browse">Browse Talent</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/talent/saved">Saved Talent</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Find Work</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/jobs/browse">Browse Jobs</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/jobs/saved">Saved Jobs</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>AI Chat</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

       
</div>
        {/* Search bar - hidden on mobile, shown on desktop */}
        {user?( <div className="relative flex gap-5 mx-5 items-center ">
     
        <div className="hidden sm:flex items-center border-2 border-gray-300 rounded-md bg-background pr-2 ml-2">
  <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-md bg-background text-sm border-none focus:outline-none"
          />
         <SearchIcon />
         
        </div>

             <div>
            {
              mode==="light"? <button onClick={()=>{
                setMode("dark")
                setTheme("dark")
              
              }}>
<Moon/>

              </button>: <button onClick={()=>{
                setMode("light")
                setTheme("light")
              
              }}>
                <Sun/>
              </button>
            }

</div>

   <div  className="">

{user?.onBoarding===true ?
<Link href={`/onBoarding`} className="border-2 border-foreground p-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold">Get Started</Link>  :(
   <div className="relative group inline-block">
      {/* Profile Image */}
      <Image
        src={user?.profilePicture}
        width={50}
        height={50}
        alt="profile"
        className="rounded-full cursor-pointer border border-gray-300"
      />

      {/* Dropdown Menu (Visible on Hover) */}
      <div className="absolute right-0 pl-4 w-40 hidden group-hover:flex flex-col bg-white dark:bg-gray-900 shadow-md rounded-lg z-50">
        <Link
          href="/profile"
          className="px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Profile
        </Link>
        <button
        onClick={logOut}
          className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
        >
          Logout
        </button>
      </div>
    </div>
)
}
    
   </div>

        </div>):
       ( 
       <div className="flex gap-2 px-3">
  <Link href="/signup" className="border-2 border-foreground p-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold focus:bg-foreground focus:text-background">SignUp</Link>
  <Link href="/login" className="border-2 border-foreground p-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold focus:bg-foreground focus:text-background">LogIn</Link>
  
       </div> )
        }
       
      </div>
    </header>
  );
}