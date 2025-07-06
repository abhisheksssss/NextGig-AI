"use client"
import axiosInstance from "@/lib/axios";
import React, { createContext, useContext, useEffect, useState } from "react";



export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "Freelancer" | "Client";
  createdAt: string; // or Date if you prefer
  updatedAt: string; // or Date if you prefer
}

interface TokenContextType {
  user: IUser| null;
  setUser: (user: IUser | null) => void;
}

const UserContext= createContext<TokenContextType|undefined>(undefined);

const UserProvider = ({children}:{children: React.ReactNode}) => {

    const [user,setUser]=useState<IUser|null>(null)


    const getUser=async()=>{
     try {
        const data=await axiosInstance.get("/api/auth/me");

        if(data){
            console.log("This is data",data?.data?.data)
      setUser(data?.data?.data);
        }
     } catch (error) {
        console.log(error)

     }   
    }

useEffect(()=>{
getUser()
    },[])


  return (
    <UserContext.Provider value={{user,setUser}}>
    {children}
    </UserContext.Provider>
  )
}

export default UserProvider



export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};


