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
import {
  UserCircle,
  Briefcase,
  Code2,
  ImageIcon,
  MailIcon,
  Building2,
  Rocket,
  CheckCircle,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileSetup() {
  const { user } = useUser();

  const router=useRouter();


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
    profilePicture: null,
    resumePdf: null,
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

  const handleFileChange = (field: string, files: FileList | null) => {
    if (files && files[0]) {
      setFormData((prev: any) => ({ ...prev, [field]: files[0] }));
    }
  };


  const handleSubmit = async () => {
    const payload = new FormData();
    payload.append("userId", user._id);
    payload.append("name", user.name);
    payload.append("email", user.email);
    payload.append("role", user.role);
    payload.append("Bio", formData.Bio);
    payload.append("ContactPreference", formData.ContactPreference);
    payload.append("contactdetails",JSON.stringify(formData.contactdetails));
    payload.append("location", formData.location);
    if (formData.profilePicture) payload.append("profilePicture", formData.profilePicture);

    if (user.role === "Freelancer") {
      payload.append("Proffession", formData.Proffession);
      payload.append("Experience", formData.Experience);
      payload.append("HourlyRate", formData.HourlyRate);
      payload.append("Portfolio", formData.Portfolio);
      payload.append("Availability", formData.Availability);
      payload.append("Skills", JSON.stringify(formData.Skills.split(",")));
      payload.append("languages", JSON.stringify(formData.languages.split(",")));
      if (formData.resumePdf) payload.append("resumePdf", formData.resumePdf);
    }

    if (user.role === "Client") {
      payload.append("company", formData.company);
      payload.append("Field", JSON.stringify(formData.Field.split(",")));
    }

    try {
      const response = await axiosInstance.post(`/api/onBoarding/Freelancer`, payload);
      console.log("Success:", response.data);
      toast.success("Onboarding successFull");
router.push("/")
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Onboarding Failed");
    }
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
      <Swiper pagination={{ clickable: true }} modules={[Pagination]} className="mySwiper w-full">
        <SwiperSlide key="about">
          <div className="flex items-center justify-center p-4">
            {commonCard(
              <>
                <Label>Bio</Label>
                <Textarea value={formData.Bio} onChange={(e) => handleChange("Bio", e.target.value)} />
                <Label>Location</Label>
                <Input value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
                <Label>Profile Picture</Label>
                <Input type="file"  accept="image/*"  onChange={(e) => handleFileChange("profilePicture", e.target.files)} />
              </>,
              "About You",
              UserCircle
            )}
          </div>
        </SwiperSlide>

        {user.role === "Freelancer" && (
          <>
            <SwiperSlide key="freelancer-work">
              <div className="flex items-center justify-center p-4">
                {commonCard(
                  <>
                    <Label>Profession</Label>
                    <Input value={formData.Proffession} onChange={(e) => handleChange("Proffession", e.target.value)} />
                    <Label>Experience (Years)</Label>
                    <Input type="number" value={formData.Experience} onChange={(e) => handleChange("Experience", e.target.value)} />
                    <Label>Hourly Rate ($)</Label>
                    <Input type="number" value={formData.HourlyRate} onChange={(e) => handleChange("HourlyRate", e.target.value)} />
                  </>,
                  "Work Info",
                  Briefcase
                )}
              </div>
            </SwiperSlide>

            <SwiperSlide key="freelancer-skills">
              <div className="flex items-center justify-center p-4">
                {commonCard(
                  <>
                    <Label>Skills (comma separated)</Label>
                    <Input value={formData.Skills} onChange={(e) => handleChange("Skills", e.target.value)} />
                    <Label>Languages (comma separated)</Label>
                    <Input value={formData.languages} onChange={(e) => handleChange("languages", e.target.value)} />
                  </>,
                  "Skills & Languages",
                  Code2
                )}
              </div>
            </SwiperSlide>

            <SwiperSlide key="freelancer-portfolio">
              <div className="flex items-center justify-center p-4">
                {commonCard(
                  <>
                    <Label>Portfolio</Label>
                    <Textarea value={formData.Portfolio} onChange={(e) => handleChange("Portfolio", e.target.value)} />
                    <Label>Resume (PDF)</Label>
                    <Input type="file" onChange={(e) => handleFileChange("resumePdf", e.target.files)} />
                  </>,
                  "Portfolio & Resume",
                  ImageIcon
                )}
              </div>
            </SwiperSlide>
          </>
        )}

        {user.role === "Client" && (
          <SwiperSlide key="client-details">
            <div className="flex items-center justify-center p-4">
              {commonCard(
                <>
                  <Label>Company Name</Label>
                  <Input value={formData.company} onChange={(e) => handleChange("company", e.target.value)} />
                  <Label>Bio</Label>
                  <Textarea value={formData.Bio} onChange={(e) => handleChange("Bio", e.target.value)} />
                  <Label>Fields of Work (comma separated)</Label>
                  <Input value={formData.Field} onChange={(e) => handleChange("Field", e.target.value)} />
                </>,
                "Client Info",
                Building2
              )}
            </div>
          </SwiperSlide>
        )}

        <SwiperSlide key="contact">
          <div className="flex items-center justify-center p-4">
            {commonCard(
              <>
                <Label>Contact Preference</Label>
                <select value={formData.ContactPreference} onChange={(e) => handleChange("ContactPreference", e.target.value)}>
                  <option value="Email">Email</option>
                  <option value="Chat">Chat</option>
                </select>
                <Label>Email</Label>
                <Input type="email" value={formData.contactdetails.email} onChange={(e) => handleNestedChange("contactdetails", "email", e.target.value)} />
                <Label>Phone</Label>
                <Input value={formData.contactdetails.phone} onChange={(e) => handleNestedChange("contactdetails", "phone", e.target.value)} />
              </>,
              "Contact Info",
              MailIcon
            )}
          </div>
        </SwiperSlide>

        <SwiperSlide key="submit">
          <div className="flex items-center justify-center p-4">
            {commonCard(
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">All Set!</h2>
                <p className="text-gray-500 mb-4">Review your details and submit your profile.</p>
                <Button onClick={handleSubmit} className="w-full">
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
