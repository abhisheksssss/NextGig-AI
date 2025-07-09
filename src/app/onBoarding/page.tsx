"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Navigation } from "swiper/modules";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import Image from "next/image";

interface ContactDetails {
  email: string;
  phone: string;
}

interface FormData {
  Proffession: string;
  Skills: string;
  Experience: string;
  HourlyRate: string;
  Portfolio: string;
  Availability: string;
  Bio: string;
  languages: string;
  ContactPreference: string;
  contactdetails: ContactDetails;
  profileVisibility: string;
  profilePicture: File | null;
  resumePdf: File | null;
  location: string;
  company: string;
  Field: string;
}

export default function ProfileSetup() {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [formData, setFormData] = useState<FormData>({
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

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg font-medium">Loading your profile...</p>
      </div>
    </div>
  );

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof FormData, child: keyof ContactDetails, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent] as ContactDetails,
        [child]: value,
      },
    }));
  };

  const handleFileChange = (field: keyof FormData, files: FileList | null) => {
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [field]: files[0] }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = new FormData();
    
    // Add common fields
    payload.append("userId", user._id);
    payload.append("name", user.name);
    payload.append("email", user.email);
    payload.append("role", user.role);
    payload.append("Bio", formData.Bio);
    payload.append("ContactPreference", formData.ContactPreference);
    payload.append("contactdetails", JSON.stringify(formData.contactdetails));
    payload.append("location", formData.location);
    payload.append("Availability",formData.Availability)
    if (formData.profilePicture) {
      payload.append("profilePicture", formData.profilePicture);
    }

    // Role-specific fields
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
      toast.success("Profile setup completed successfully!");
      router.push("/");
      window.location.href="/"
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Profile setup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonCard = (children: React.ReactNode, title: string, Icon: React.ElementType) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md space-y-6 p-8 bg-background rounded-xl shadow-lg border border-border"
    >
      <div className="flex items-center gap-3 text-xl font-semibold">
        <Icon className="w-6 h-6 text-primary" />
        <h2>{title}</h2>
      </div>
      {children}
    </motion.div>
  );

  const totalSlides = user.role === "Freelancer" ? 6 : 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Complete Your {user.role} Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            {activeIndex + 1} of {totalSlides} steps
          </p>
          <Progress value={((activeIndex + 1) / totalSlides) * 100} className="mt-4 h-2" />
        </div>

        <div className="relative">
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination, Navigation, EffectFade]}
            className="mySwiper"
            effect="fade"
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          >
            {/* About Slide */}
            <SwiperSlide key="about-slide">
              <div className="flex justify-center">
                {commonCard(
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.Bio}
                          onChange={(e) => handleChange("Bio", e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="min-h-[120px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          placeholder="Where are you based?"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profilePicture">Profile Picture</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="relative w-16 h-16 rounded-full bg-muted overflow-hidden border">
                            {formData.profilePicture ? (
                              <Image
                                src={URL.createObjectURL(formData.profilePicture)}
                                alt="Profile preview"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <UserCircle size={24} />
                              </div>
                            )}
                          </div>
                          <Input
                            id="profilePicture"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange("profilePicture", e.target.files)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </>,
                  "About You",
                  UserCircle
                )}
              </div>
            </SwiperSlide>

            {/* Freelancer Work Info */}
            {user.role === "Freelancer" && (
              <>
                <SwiperSlide key="freelancer-work-info">
                  <div className="flex justify-center">
                    {commonCard(
                      <>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="profession">Profession</Label>
                            <Input
                              id="profession"
                              value={formData.Proffession}
                              onChange={(e) => handleChange("Proffession", e.target.value)}
                              placeholder="e.g. Web Developer, Graphic Designer"
                            />
                          </div>
                          <div>
                            <Label htmlFor="experience">Experience (Years)</Label>
                            <Input
                              id="experience"
                              type="number"
                              value={formData.Experience}
                              onChange={(e) => handleChange("Experience", e.target.value)}
                              placeholder="How many years of experience?"
                            />
                          </div>
                          <div>
                            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <Input
                                id="hourlyRate"
                                type="number"
                                value={formData.HourlyRate}
                                onChange={(e) => handleChange("HourlyRate", e.target.value)}
                                className="pl-8"
                                placeholder="Your expected rate"
                              />
                            </div>
                          </div>
                        </div>
                      </>,
                      "Work Info",
                      Briefcase
                    )}
                  </div>
                </SwiperSlide>

                {/* Skills & Languages */}
                <SwiperSlide key="freelancer-skills-languages">
                  <div className="flex justify-center">
                    {commonCard(
                      <>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="skills">Skills (comma separated)</Label>
                            <Input
                              id="skills"
                              value={formData.Skills}
                              onChange={(e) => handleChange("Skills", e.target.value)}
                              placeholder="e.g. JavaScript, UI/UX, Project Management"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              Separate multiple skills with commas
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="languages">Languages (comma separated)</Label>
                            <Input
                              id="languages"
                              value={formData.languages}
                              onChange={(e) => handleChange("languages", e.target.value)}
                              placeholder="e.g. English, Spanish, French"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              Separate multiple languages with commas
                            </p>
                          </div>
                        </div>
                      </>,
                      "Skills & Languages",
                      Code2
                    )}
                  </div>
                </SwiperSlide>

                {/* Portfolio & Resume */}
                <SwiperSlide key="freelancer-portfolio-resume">
                  <div className="flex justify-center">
                    {commonCard(
                      <>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="portfolio">Portfolio Links</Label>
                            <Textarea
                              id="portfolio"
                              value={formData.Portfolio}
                              onChange={(e) => handleChange("Portfolio", e.target.value)}
                              placeholder="Links to your work, GitHub, Behance, etc."
                              className="min-h-[100px]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="resume">Resume (PDF)</Label>
                            <div className="flex items-center gap-4 mt-2">
                              {formData.resumePdf ? (
                                <div className="flex-1 p-3 border rounded-md bg-muted/50">
                                  <p className="text-sm font-medium truncate">
                                    {formData.resumePdf.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(formData.resumePdf.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              ) : (
                                <div className="flex-1 p-3 border rounded-md bg-muted/50 text-muted-foreground text-sm">
                                  No file selected
                                </div>
                              )}
                              <div>
                                <Label
                                  htmlFor="resume-upload"
                                  className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                >
                                  Choose File
                                </Label>
                                <Input
                                  id="resume-upload"
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => handleFileChange("resumePdf", e.target.files)}
                                  className="hidden"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>,
                      "Portfolio & Resume",
                      ImageIcon
                    )}
                  </div>
                </SwiperSlide>
              </>
            )}

            {/* Client Info */}
            {user.role === "Client" && (
              <SwiperSlide key="client-info">
                <div className="flex justify-center">
                  {commonCard(
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleChange("company", e.target.value)}
                            placeholder="Your company name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientBio">Company Bio</Label>
                          <Textarea
                            id="clientBio"
                            value={formData.Bio}
                            onChange={(e) => handleChange("Bio", e.target.value)}
                            placeholder="Tell us about your company..."
                            className="min-h-[120px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="field">Fields of Work (comma separated)</Label>
                          <Input
                            id="field"
                            value={formData.Field}
                            onChange={(e) => handleChange("Field", e.target.value)}
                            placeholder="e.g. Technology, Marketing, Finance"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Separate multiple fields with commas
                          </p>
                        </div>
                      </div>
                    </>,
                    "Client Info",
                    Building2
                  )}
                </div>
              </SwiperSlide>
            )}

            {/* Contact Info */}
            <SwiperSlide key="contact-info">
              <div className="flex justify-center">
                {commonCard(
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label>Contact Preference</Label>
                        <Select
                          value={formData.ContactPreference}
                          onValueChange={(value) => handleChange("ContactPreference", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Chat">Chat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.contactdetails.email}
                          onChange={(e) => handleNestedChange("contactdetails", "email", e.target.value)}
                          placeholder="Your contact email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          value={formData.contactdetails.phone}
                          onChange={(e) => handleNestedChange("contactdetails", "phone", e.target.value)}
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                         <div>
                        <Label>Contact Preference</Label>
                        <Select
                          value={formData.Availability}
                          onValueChange={(value) => handleChange("Availability", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </>,
                  "Contact Info",
                  MailIcon
                )}
              </div>
            </SwiperSlide>

            {/* Completion Slide */}
            <SwiperSlide key="completion-slide">
              <div className="flex justify-center">
                {commonCard(
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                      </motion.div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">All Set!</h2>
                      <p className="text-muted-foreground mt-2">
                        Review your details and submit your profile.
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2 max-h-60 overflow-y-auto">
                      <h3 className="font-medium">Profile Summary</h3>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Bio:</span> {formData.Bio || "Not provided"}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Location:</span> {formData.location || "Not provided"}
                      </p>
                      {user.role === "Freelancer" && (
                        <>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Profession:</span> {formData.Proffession || "Not provided"}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Experience:</span> {formData.Experience ? `${formData.Experience} years` : "Not provided"}
                          </p>
                        </>
                      )}
                      {user.role === "Client" && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Company:</span> {formData.company || "Not provided"}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleSubmit}
                      className="w-full mt-4"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Rocket className="w-5 h-5 mr-2" />
                          Complete Profile Setup
                        </span>
                      )}
                    </Button>
                  </div>,
                  "Finish",
                  Rocket
                )}
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background p-3 rounded-full shadow-md border hover:bg-muted transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background p-3 rounded-full shadow-md border hover:bg-muted transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}