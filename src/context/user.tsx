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
  onBoarding:boolean
}

export interface Ifreelancer {
  _id:string
    userId: string;
    name: string;
    email: string;
    role: "Freelancer";
    Proffession: string;
    Skills: string[];
    Experience: number;
    HourlyRate: number;
    Portfolio: string[];
    Availability: "Full-time" | "Part-time" | "Freelance";
    Bio: string;
    languages: string[];
    ContactPreference: "Email" | "Chat";
    contactdetails: {
        email: string;
        phone?: string;
    };
    profileVisibility: "Public" | "Private";
    profilePicture?: string;
    location?: string;
    createdAt?: Date;
    updatedAt?: Date;
    resumePdf?:string;
}


export interface IClient {
  _id:string
    userId: string;
    name: string;
    email: string;
    role: "Client";
    company?: string;
    Bio: string;
    Field:string[];
    ContactPreference: "Email" | "Chat";
    contactdetails: {
        email: string;
        phone?: string;
    }
    createdAt?: Date;
    updatedAt?: Date;   
    profilePicture?: string;
    location?: string;
}









interface TokenContextType {
  user:  IUser|Ifreelancer|IClient| null;
  setUser: (user: IUser|Ifreelancer|IClient | null) => void;
}

const UserContext= createContext<TokenContextType|undefined>(undefined);

const UserProvider = ({children}:{children: React.ReactNode}) => {

    const [user,setUser]=useState<IUser|Ifreelancer|IClient|null>(null)


    const getUser=async()=>{
     try {
        const data=await axiosInstance.get("/api/auth/me");


        if(data){
if(data.data.data.onBoarding===true){
    const response=await axiosInstance.get("/api/auth/onBoardedUserData")
    console.log(response)
    console.log("This is onBoarded Data",response.data.data)
    setUser(response?.data?.data[0])
    console.log(response.data.data[0])
}else{
     console.log("This is data",data?.data?.data)
      setUser(data?.data?.data);
}
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


