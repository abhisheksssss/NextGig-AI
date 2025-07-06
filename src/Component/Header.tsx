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

export function Header() {
  return (
    <header className="w- screen sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pl-5">
      <div className=" w-full border-2 border-white flex flex-col sm:flex-row  justify-between items-center gap-4 py-3 border-b">
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
        <div className="relative w-full hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <SearchIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}