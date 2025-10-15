"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, SearchIcon, Menu, X } from "lucide-react";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Logo from "@/public/image.png";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
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
} from "@/components/ui/select";
import { usePathname } from "next/navigation";

export function Header() {
  const { user } = useUser();
  const router = useRouter();
  const { setTheme } = useTheme();
  const pathname = usePathname();

  const [mode, setMode] = React.useState("light");
  const [query, setQuery] = React.useState<string | null>(null);
  const [queryType, setQueryType] = React.useState<string>("Client");
  const [isSliderOpen, setIsSliderOpen] = React.useState(false);

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

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-5">
        <div className="w-full border-2 rounded-b-xl shadow-2xl flex justify-between items-center py-3 border-b gap-4">
          {/* Logo and Navigation - Grouped Together */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                if (pathname !== "/") {
                  router.push("/");
                }
              }}
            >
              <Image src={Logo} alt="Company Logo" width={40} height={40} className="sm:w-[50px] sm:h-[50px]" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="flex items-center space-x-1">
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/"
                      className="px-3 py-2 text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                      Home
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="px-3 py-2 text-sm font-medium">
                      Find Talent
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-3 p-4">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/talent/browse"
                              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                              Browse Talent
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/talent/saved"
                              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                              Saved Talent
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="px-3 py-2 text-sm font-medium">
                      Find Work
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-3 p-4">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/jobs/browse"
                              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                              Browse Jobs
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/jobs/saved"
                              className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                              Saved Jobs
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink
                      href="/chatWithAi"
                      className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      AI Chat
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Search Bar - Centered */}
          {user && (
            <div className="hidden md:flex items-center border-2 flex-1 max-w-[400px] border-gray-300 rounded-md bg-background pr-1">
              <Select value={queryType} onValueChange={setQueryType}>
                <SelectTrigger className="max-w-fit border-none">
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
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-background text-sm border-none focus:outline-none"
              />
              {query && queryType && (
                <Link href={`/webSearch/${queryType}/${query}`} onClick={() => setQuery(null)}>
                  <div className="ml-2 pl-2 hover:bg-accent p-2 rounded-md">
                    <SearchIcon size={18} />
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                {/* Desktop Icons */}
                <div className="hidden md:flex gap-4 items-center">
                  {user?.onBoarding === true && (
                    <Link href="/chat">
                      <MessageCircle className="cursor-pointer hover:text-blue-600" />
                    </Link>
                  )}
                  {mode === "light" ? (
                    <button
                      onClick={() => {
                        setMode("dark");
                        setTheme("dark");
                      }}
                    >
                      <Moon className="cursor-pointer hover:text-blue-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMode("light");
                        setTheme("light");
                      }}
                    >
                      <Sun className="cursor-pointer hover:text-blue-600" />
                    </button>
                  )}
                </div>

                {/* Profile or Get Started */}
                {user?.onBoarding === false ? (
                  <div className="flex gap-2">
                    <button
                      onClick={logOut}
                      className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-red-600 border-2 rounded-xl border-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Logout
                    </button>
                    <Link
                      href="/onBoarding"
                      className="border-2 border-foreground px-2 sm:px-4 py-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold text-xs sm:text-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Desktop Profile */}
                    <Image
                      src={(user as Ifreelancer | IClient)?.profilePicture || avatar}
                      width={40}
                      height={40}
                      alt="profile"
                      className="hidden md:block rounded-full cursor-pointer border border-gray-300 sm:w-[50px] sm:h-[50px]"
                      onClick={() => setIsSliderOpen(true)}
                    />

                    {/* Mobile/Tablet Menu Button */}
                    <button className="md:hidden" onClick={() => setIsSliderOpen(true)}>
                      <Menu size={24} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/signup"
                  className="border-2 border-foreground px-2 sm:px-4 py-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold text-xs sm:text-sm"
                >
                  SignUp
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-foreground px-2 sm:px-4 py-2 rounded-lg shadow-2xl text-foreground hover:bg-accent font-bold text-xs sm:text-sm"
                >
                  LogIn
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Custom Slider from Right */}
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
            isSliderOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsSliderOpen(false)}
        />

        {/* Slider Panel */}
        <div
          className={`fixed right-0 top-0 h-full w-[280px] sm:w-[350px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto slider-scrollbar ${
            isSliderOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b animate-fade-in">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={() => setIsSliderOpen(false)}
              className="hover:rotate-90 transition-transform duration-300"
            >
              <X size={24} className="hover:text-red-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col p-6 space-y-4">
            {/* Profile Picture (Mobile Only) */}
            {user?.onBoarding === true && (
              <div className="flex items-center gap-3 pb-4 border-b animate-slide-in-right animation-delay-100">
                <Image
                  src={(user as Ifreelancer | IClient)?.profilePicture || avatar}
                  width={60}
                  height={60}
                  alt="profile"
                  
                  className="rounded-full border-2 border-gray-300"
                />
                <div>
                  <p className="font-semibold">
                    {(user as Ifreelancer | IClient)?.name || "User"}
                  </p>
                  <p className="text-sm text-gray-500">{user?.role}</p>
                </div>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="lg:hidden space-y-3 pb-4 border-b animate-slide-in-right animation-delay-200">
              <Link
                href="/"
                className="block py-2 hover:text-blue-600 font-medium hover:translate-x-2 transition-transform duration-200"
                onClick={() => setIsSliderOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/talent/browse"
                className="block py-2 hover:text-blue-600 hover:translate-x-2 transition-transform duration-200"
                onClick={() => setIsSliderOpen(false)}
              >
                Browse Talent
              </Link>
              <Link
                href="/talent/saved"
                className="block py-2 hover:text-blue-600 hover:translate-x-2 transition-transform duration-200"
                onClick={() => setIsSliderOpen(false)}
              >
                Saved Talent
              </Link>
              <Link
                href="/jobs/browse"
                className="block py-2 hover:text-blue-600 hover:translate-x-2 transition-transform duration-200"
                onClick={() => setIsSliderOpen(false)}
              >
                Browse Jobs
              </Link>
              <Link
                href="/jobs/saved"
                className="block py-2 hover:text-blue-600 hover:translate-x-2 transition-transform duration-200"
                onClick={() => setIsSliderOpen(false)}
              >
                Saved Jobs
              </Link>
              <Link
                href="/chatWithAi"
                className="block py-2 hover:text-blue-600 hover:translate-x-2 transition-transform duration-200"
                onClick={() => setIsSliderOpen(false)}
              >
                AI Chat
              </Link>
            </div>

            {/* Search (Mobile Only) */}
            {user && (
              <div className="md:hidden space-y-3 pb-4 border-b animate-slide-in-right animation-delay-300">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Search</h3>
                <Select value={queryType} onValueChange={setQueryType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                    <SelectItem value="Jobs">Jobs</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center border-2 border-gray-300 rounded-md bg-background">
                  <input
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-md bg-background text-sm border-none focus:outline-none"
                  />
                  {query && queryType && (
                    <Link
                      href={`/webSearch/${queryType}/${query}`}
                      onClick={() => {
                        setQuery(null);
                        setIsSliderOpen(false);
                      }}
                    >
                      <div className="px-3">
                        <SearchIcon size={18} />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Profile Links */}
            {user?.onBoarding === true && (
              <div className="space-y-3 pb-4 border-b animate-slide-in-right animation-delay-400">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Account</h3>
                <Link
                  href="/profile"
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-2"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Profile
                </Link>

                {user?.role === "Freelancer" ? (
                  <Link
                    href="/applications"
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-2"
                    onClick={() => setIsSliderOpen(false)}
                  >
                    Applied For
                  </Link>
                ) : (
                  <Link
                    href="/applications/applicants"
                    className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-2"
                    onClick={() => setIsSliderOpen(false)}
                  >
                    Posted Jobs
                  </Link>
                )}

                <Link
                  href="/createdContact/showingJobs"
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-2"
                  onClick={() => setIsSliderOpen(false)}
                >
                  Contracts
                </Link>
              </div>
            )}

            {/* Actions (Mobile) */}
            <div className="md:hidden space-y-3 pb-4 border-b animate-slide-in-right animation-delay-500">
              <h3 className="font-semibold text-sm text-gray-500 uppercase">Actions</h3>
              {user?.onBoarding === true && (
                <Link
                  href="/chat"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 hover:translate-x-2"
                  onClick={() => setIsSliderOpen(false)}
                >
                  <MessageCircle size={20} />
                  <span>Messages</span>
                </Link>
              )}
              <button
                onClick={() => {
                  if (mode === "light") {
                    setMode("dark");
                    setTheme("dark");
                  } else {
                    setMode("light");
                    setTheme("light");
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md w-full transition-all duration-200 hover:translate-x-2"
              >
                {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
                <span>{mode === "light" ? "Dark Mode" : "Light Mode"}</span>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                logOut();
                setIsSliderOpen(false);
              }}
              className="px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 font-semibold w-full text-left hover:translate-x-2 animate-slide-in-right animation-delay-600"
            >
              Logout
            </button>
          </div>
        </div>
      </>

      <style jsx global>{`
        .slider-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .slider-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.4s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
      `}</style>
    </>
  );
}
