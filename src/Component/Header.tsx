"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, SearchIcon } from "lucide-react";
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
import { IClient, Ifreelancer, useUser } from "@/context/user";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import avatar from "@/public/avatar.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
export function Header() {
  const { user } = useUser();

  const router = useRouter();

  const logOut = async () => {
    try {
      const logOut = await axiosInstance.get("/api/auth/logOut");
      if (logOut) {
        toast.success("LogOut successfully");
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [mode, setMode] = React.useState("light");

  const { setTheme } = useTheme();
const [query,setQuery]=React.useState<string|null>(null);
const [queryType,setQueryType]=React.useState<string>("Client");



  return (
    <header className="w- full  sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5">
      <div className=" w-full border-2 rounded-b-xl shadow-2xl flex flex-col sm:flex-row  justify-between items-center gap-4 py-3 border-b">
        {/* Logo or Brand - Add your logo here */}

        <div
          className="flex "
          onClick={() => {
            router.push("/");
          }}
        >
          <Image src={Logo} alt="my-image" width={50} height={50} />

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
                <NavigationMenuLink href="/chatWithAi">
                  AI Chat
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        
        {/* Search bar - hidden on mobile, shown on desktop */}

{    user&& <div className="hidden md:flex items-center border-2 w-full max-w-[30%] border-gray-300 rounded-md bg-background pr-1 ml-2">
<Select value={queryType} onValueChange={setQueryType}>
  <SelectTrigger className="max-w-fit">
    <SelectValue placeholder="userType" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Client">Client</SelectItem>
    <SelectItem value="Freelancer">Freelancer</SelectItem>
    <SelectItem value="Jobs">Jobs</SelectItem>
  </SelectContent>
</Select>

          <input
            type="text"
            placeholder="Search..."
            onChange={(e)=>setQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-background text-sm border-none focus:outline-none"
          />
          <div className={`ml-2 pl-2 transition-all duration-300 ease-in-out hover:bg-accent hover:text-shadow-2xl text-shadow-foreground ${(!query|| !queryType) && 'hidden'} `}
          onClick={()=>setQuery(null)}
          >
      <Link href={`/webSearch/${queryType}/${query}`}>
          <SearchIcon/>
            </Link>
          </div>

        </div>
        
        }

        <div className="flex items-center gap-3 ">
          {user ? (
            <div className="relative flex gap-5 mx-5 items-center ">
              <div className="flex gap-5">
                <div>
                  {user?.onBoarding === true && (
                    <Link href={"/chat"}>
                      <MessageCircle />
                    </Link>
                  )}
                </div>
                <div>
                  {mode === "light" ? (
                    <button
                      onClick={() => {
                        setMode("dark");
                        setTheme("dark");
                      }}
                    >
                      <Moon />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMode("light");
                        setTheme("light");
                      }}
                    >
                      <Sun />
                    </button>
                  )}
                </div>
              </div>

              <div className="">
                {user?.onBoarding === false ? (
                  <div className="flex gap-2">
                    <button
                      onClick={logOut}
                      className="px-4 py-2 text-sm text-red-600 border-2 rounded-xl border-foreground hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                    >
                      Logout
                    </button>
                    <Link
                      href={`/onBoarding`}
                      className="border-2 border-foreground p-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="relative group inline-block">
                    {/* Profile Image */}
                    <Image
                      src={
                        (user as Ifreelancer | IClient)?.profilePicture ||
                        avatar
                      }
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

                      {user.role === "Freelancer" ? (
                        <Link
                          href={"/applications"}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Applied For
                        </Link>
                      ) : (
                        <Link
                          href={"/applications/applicants"}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Posted Jobs
                        </Link>
                      )}
                      {user.role === "Freelancer" ? (
                        <Link
                          href={"/createdContact/showingJobs"}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                        Contracts
                        </Link>
                      ) : (
                        <Link
                          href={"/createdContact/showingJobs"}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Contracts
                        </Link>
                      )}

                      <button
                        onClick={logOut}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 px-3">
              <Link
                href="/signup"
                className="border-2 border-foreground p-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold focus:bg-foreground focus:text-background"
              >
                SignUp
              </Link>
              <Link
                href="/login"
                className="border-2 border-foreground p-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold focus:bg-foreground focus:text-background"
              >
                LogIn
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
