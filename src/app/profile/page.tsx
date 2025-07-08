"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Pencil, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user";
import { Header } from "@/Component/Header";
import type { IClient, Ifreelancer } from "@/context/user";

// Type guards
function isFreelancer(user: any): user is Ifreelancer {
  return user?.role === "Freelancer";
}

function isClient(user: any): user is IClient {
  return user?.role === "Client";
}

export default function ProfilePage() {
  const [showMore, setShowMore] = useState(false);
  const { user } = useUser();

  if (!user) return <div className="text-center p-10">Loading...</div>;

  return (
    <>
      <Header />
    { isFreelancer(user) || isClient(user) &&  <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={user?.profilePicture || "/avatar.png"}
                width={64}
                height={64}
                alt="Profile"
                className="rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                <Pencil size={14} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin size={15} className="mr-1" /> {user.location}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">See public view</Button>
            <Button>Profile settings</Button>
            <Button variant="ghost" size="icon">
              <Share2 size={18} />
            </Button>
          </div>
        </div>

        {/* Role Specific Content */}
        {isFreelancer(user) && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Profession: {user.Proffession}</h2>
              <Pencil size={16} />
            </div>
            <p className="text-lg font-semibold mt-1">Hourly Rate: ${user.HourlyRate}/hr</p>

            <div className="mt-4 space-y-2">
              <p className="font-medium">{user.name} | {user.Proffession}</p>
              <p>BIO: {user.Bio}</p>
              {showMore && (
                <p>
                  Skills: {user.Skills.join(", ")}<br />
                  Experience: {user.Experience} years<br />
                  Availability: {user.Availability}<br />
                  Languages: {user.languages.join(", ")}<br />
                </p>
              )}
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-green-600 hover:underline"
              >
                {showMore ? "less" : "more"}
              </button>
            </div>
          </div>
        )}

        {isClient(user) && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Company: {user.company || "Independent Client"}</h2>
              <Pencil size={16} />
            </div>
            <div className="mt-4 space-y-2">
              <p className="font-medium">{user.name} | Client</p>
              <p>BIO: {user.Bio}</p>
              {showMore && (
                <p>
                  Fields of Interest: {user.Field.join(", ")}<br />
                  Preferred Contact: {user.ContactPreference}<br />
                </p>
              )}
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-green-600 hover:underline"
              >
                {showMore ? "less" : "more"}
              </button>
            </div>
          </div>
        )}

    {/* Contact Section */}
        <div className="mt-10 bg-accent p-4 rounded-lg">
          <h4 className="text-lg font-semibold">Contact Information</h4>
          <p>Email: {user.contactdetails?.email}</p>
          {user.contactdetails?.phone && <p>Phone: {user.contactdetails.phone}</p>}   
 
        </div>
      </div>
      }
    </>
  );
} 
