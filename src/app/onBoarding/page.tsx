"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user";

// Lucide Icons
import {
  UserCircle,
  MapPin,
  PencilLine,
  Briefcase,
  Code2,
  Languages,
  ImageIcon,
  EyeIcon,
  MailIcon,
  Phone,
  Building2,
  Rocket,
  CheckCircle,
} from "lucide-react";

export default function ProfileSetup() {
  const { user } = useUser();

  const [formData, setFormData] = useState<any>({
    Proffession: "",
    Skills: "",
    Experience: "",
    HourlyRate: "",
    Portfolio: "",
    Availability: "Freelance",
    Bio: "",
    languages: "",
    ContactPreference: "Email",
    contactdetails: {
      email: "",
      phone: "",
    },
    profileVisibility: "Public",
    profilePicture: "",
    location: "",
    company: "",
    Field: "",
  });

  if (!user) return <p className="text-center pt-10">Loading profile...</p>;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, child: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value,
      },
    }));
  };

  const commonCard = (children: React.ReactNode, title: string, Icon: any) => (
    <div className="w-full max-w-md space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-muted-foreground/20 dark:border-gray-700">
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        <Icon className="w-6 h-6 text-primary" />
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Swiper
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="mySwiper w-full"
      >
        {/* Slide 1 - Bio & Location */}
        <SwiperSlide>
          <div className="flex items-center justify-center p-4">
            {commonCard(
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <PencilLine className="w-4 h-4" /> Bio
                  </Label>
                  <Textarea
                    placeholder="Tell us something about yourself..."
                    value={formData.Bio}
                    onChange={(e) => handleChange("Bio", e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4" /> Location
                  </Label>
                  <Input
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </>,
              "About You",
              UserCircle
            )}
          </div>
        </SwiperSlide>

        {/* Freelancer */}
        {user.role === "Freelancer" && (
          <>
            <SwiperSlide>
              <div className="flex items-center justify-center p-4">
                {commonCard(
                  <>
                    <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Briefcase className="w-4 h-4" /> Profession
                    </Label>
                    <Input
                      placeholder="e.g. Web Developer"
                      value={formData.Proffession}
                      onChange={(e) => handleChange("Proffession", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Label className="text-gray-700 dark:text-gray-300">Experience (years)</Label>
                    <Input
                      type="number"
                      value={formData.Experience}
                      onChange={(e) => handleChange("Experience", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Label className="text-gray-700 dark:text-gray-300">Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      value={formData.HourlyRate}
                      onChange={(e) => handleChange("HourlyRate", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </>,
                  "Work Info",
                  Briefcase
                )}
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="flex items-center justify-center p-4">
                {commonCard(
                  <>
                    <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Code2 className="w-4 h-4" /> Skills (comma separated)
                    </Label>
                    <Input
                      value={formData.Skills}
                      onChange={(e) => handleChange("Skills", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Languages className="w-4 h-4" /> Languages
                    </Label>
                    <Input
                      value={formData.languages}
                      onChange={(e) => handleChange("languages", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </>,
                  "Skills & Languages",
                  Code2
                )}
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="flex items-center justify-center p-4">
                {commonCard(
                  <>
                    <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <ImageIcon className="w-4 h-4" /> Portfolio Links
                    </Label>
                    <Textarea
                      placeholder="https://github.com/..."
                      value={formData.Portfolio}
                      onChange={(e) => handleChange("Portfolio", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <EyeIcon className="w-4 h-4" /> Profile Visibility
                    </Label>
                    <select
                      className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      value={formData.profileVisibility}
                      onChange={(e) => handleChange("profileVisibility", e.target.value)}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                    <Label className="text-gray-700 dark:text-gray-300">Profile Picture URL</Label>
                    <Input
                      value={formData.profilePicture}
                      onChange={(e) => handleChange("profilePicture", e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </>,
                  "Portfolio & Visibility",
                  ImageIcon
                )}
              </div>
            </SwiperSlide>
          </>
        )}

        {/* Client */}
        {user.role === "Client" && (
          <SwiperSlide>
            <div className="flex items-center justify-center p-4">
              {commonCard(
                <>
                  <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <Building2 className="w-4 h-4" /> Company Name
                  </Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                  <Label className="text-gray-700 dark:text-gray-300">Fields of Work</Label>
                  <Input
                    value={formData.Field}
                    onChange={(e) => handleChange("Field", e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </>,
                "Company Details",
                Building2
              )}
            </div>
          </SwiperSlide>
        )}

        {/* Contact Info */}
        <SwiperSlide>
          <div className="flex items-center justify-center p-4">
            {commonCard(
              <>
                <Label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <MailIcon className="w-4 h-4" /> Preferred Contact
                </Label>
                <select
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formData.ContactPreference}
                  onChange={(e) => handleChange("ContactPreference", e.target.value)}
                >
                  <option value="Email">Email</option>
                  <option value="Chat">Chat</option>
                </select>
                <Label className="text-gray-700 dark:text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={formData.contactdetails.email}
                  onChange={(e) => handleNestedChange("contactdetails", "email", e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <Label className="text-gray-700 dark:text-gray-300">Phone</Label>
                <Input
                  value={formData.contactdetails.phone}
                  onChange={(e) => handleNestedChange("contactdetails", "phone", e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </>,
              "Contact Details",
              MailIcon
            )}
          </div>
        </SwiperSlide>

        {/* Submit */}
        <SwiperSlide>
          <div className="flex items-center justify-center p-4">
            {commonCard(
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">All Set!</h2>
                <p className="text-muted-foreground dark:text-gray-400 mb-4">
                  You can always edit this information later.
                </p>
                <Button
                  className="w-full"
                  onClick={() => console.log("Profile Submitted", formData)}
                >
                  <Rocket className="w-4 h-4 mr-2" /> Submit Profile
                </Button>
              </div>,
              "Finish",
              Rocket
            )}
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}