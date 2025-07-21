"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Pencil, Share2, Mail, Phone, Globe, Briefcase, Languages, Code2, MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IClient, Ifreelancer } from "@/context/user";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import GetBack from "@/Component/subComponents/getBack";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getParticularUserData, updateChatWith } from "@/lib/api";
import { useRouter } from "next/navigation";
import SubLoader from "@/Component/subLoader";
// Type guards
function isFreelancer(user: any): user is Ifreelancer {
  return user?.role === "Freelancer";
}

function isClient(user: any): user is IClient {
  return user?.role === "Client";
}

export default function PublicView() {
  const router=useRouter()
  const queryClient= useQueryClient()
  const [showMore, setShowMore] = useState(false);
  const params=useParams()
  const  slug  = params.slug as string;
  
  const [userId,userRole]=slug.split("-")


  console.log(userId)
  console.log(userRole)

const {data:user,isLoading}=useQuery({
    queryKey:["publicView"],
    queryFn:()=> getParticularUserData(userId,userRole)
})
console.log("THis is data",user)

const { mutate: updateChatMutation, isPending } = useMutation({
  mutationFn: (chatWithId: string|null) => updateChatWith(chatWithId),
  onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatRoom'] });
    router.push("/chat");

  }
});


  if (isLoading) return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <Skeleton className="h-16 w-full" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="space-y-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <GetBack />
      {(isFreelancer(user) || isClient(user)) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto p-4 md:p-8"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Image
                  src={ (user as Ifreelancer | IClient)?.profilePicture || "/avatar.png"}
                  width={96}
                  height={96}
                  alt="Profile"
                  className="rounded-full object-cover border-4 border-primary/20 shadow-md"
                />
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer shadow-lg"
                >
                </motion.div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                <div className="flex items-center mt-2 text-muted-foreground">
                  <MapPin size={16} className="mr-1" />
                  <span>{user.location || "Location not specified"}</span>
                </div>
                {isFreelancer(user) && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm font-medium">
                      {user.Proffession}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share profile</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Role Specific Content */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {isFreelancer(user) && (
                <>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-background p-6 rounded-xl border shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Briefcase className="text-primary" size={20} />
                        Professional Overview
                      </h2>
                      
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Hourly Rate</span>
                        <span className="font-medium">${user.HourlyRate}/hr</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-medium">{user.Experience} years</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Availability</span>
                        <span className="font-medium">{user.Availability}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-background p-6 rounded-xl border shadow-sm"
                  >
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <Globe className="text-primary" size={20} />
                      About Me
                    </h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      {user.Bio || "No bio provided"}
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-background p-6 rounded-xl border shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Code2 className="text-primary" size={20} />
                        Skills & Expertise
                      </h2>
                    
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.Skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1 text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-background p-6 rounded-xl border shadow-sm">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Languages className="text-primary" size={20} />
                            Languages
                          </h3>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {user.languages.map((lang, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {user.languages.length > 0 && (
                    <Button 
                      variant="link" 
                      className="text-primary p-0"
                      onClick={() => setShowMore(!showMore)}
                    >
                      {showMore ? "Show less" : "Show more"}
                    </Button>
                  )}
                </>
              )}

              {isClient(user) && (
                <>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-background p-6 rounded-xl border shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold flex items-center gap-2">
                        <Briefcase className="text-primary" size={20} />
                        Company Information
                      </h2>
                      <Button variant="ghost" size="sm" className="text-primary">
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Company Name:{user.company || "Independent Client"}</h3>
                        <p className="text-muted-foreground mt-1 leading-relaxed">
                  BIO:        {user.Bio || "No company description provided"}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-muted-foreground">Fields of Interest</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {user.Field.map((field, index) => (
                            <Badge key={index} variant="outline" className="px-3 py-1 text-sm">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {/* Contact Section - Right Sidebar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-background p-6 rounded-xl border shadow-sm h-fit sticky top-8"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Mail className="text-primary" size={20} />
                Contact Information
              </h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.contactdetails?.email}</p>
                  </div>
                </div>
                
                {user.contactdetails?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{user.contactdetails.phone}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Preferred contact method</p>
                  <Badge variant="secondary">
                    {user.ContactPreference}
                  </Badge>
                </div>
              </div>
              
            {isPending===true?<div className='w-5 h-5 flex items-center justify-center gap-2 py-3 mt-4 text-base font-medium object-cover  rounded-lg '>
  <SubLoader/>
 </div> : (<button className='w-full flex items-center justify-center gap-2 py-3 mt-4 text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
  onClick={()=>
{    if(user){
updateChatMutation(user?.userId)
    }
    }}
  >
                <MessageCircleMore />   <p>send message</p>   
                  </button>)}
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}