"use client";
import Loader from "@/Component/loader";
import GetBack from "@/Component/subComponents/getBack";
import { IClient, useUser } from "@/context/user";
import { createContactApi, getApplicants, removeApplicant } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { ImCross } from "react-icons/im";

interface Applicant {
  Availability: string;
  Bio: string;
  ContactPreference: string;
  Experience: number;
  HourlyRate: number;
  Portfolio: string[];
  Proffession: string;
  Skills: string[];
  contactdetails: {
    email: string;
    phone: string;
  };
  createdAt: string;
  email: string;
  languages: string[];
  location: string;
  name: string;
  onBoarding: boolean;
  profilePicture: string;
  profileVisibility: string;
  resumePdf: string;
  role: string;
  updatedAt: string;
  userId: string;
  _id: string;
  __v: number;
}

const Applicants = () => {
  const { user } = useUser();
  const router = useRouter();

  const [isModelOpne, setIsModelOpen] = useState(false);

  const [createContactModal, setCreateContactModal] = useState("");

  const [particularJobId, setParticularJobId] = useState("");

  const queryClient = useQueryClient();

  const { data: applicants } = useQuery({
    queryKey: ["fetchJobData"],
    queryFn: getApplicants,
  });

  console.log(createContactModal);

  const {
    mutate: createContact,
    isPending,
    error,
  } = useMutation({
    mutationKey: ["createContact"],
    mutationFn: ({
      freelancerId,
      clientId,
      jobId,
      budget,
    }: {
      freelancerId: string;
      clientId: string;
      jobId: string;
      budget: string;
    }) => createContactApi(freelancerId, clientId, jobId, budget),
    onSuccess: (data) => {
      toast.success("SuccessFully Hiered");
      queryClient.invalidateQueries({ queryKey: ["fetchJobData"] });
      router.push(`/createdContact/${data._id}`);
    },
  });

  const {
    mutate: removeApplicants,
    isPending: isRemoving,
    error: errorInRemoving,
  } = useMutation({
    mutationKey: ["removeApplicants"],
    mutationFn: ({
      freelancerId,
      jobId,
    }: {
      freelancerId: string;
      jobId: string;
    }) => removeApplicant(freelancerId, jobId),
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchJobData"] });
    },
  });

  if (errorInRemoving) {
    toast.error("Error in removing");
  }

  if (error) {
    toast.error("Error is Hiring");
  }

  if (!applicants || !user) {
    return (
      <div className="flex w-screen h-screen justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative">
      <div>
        <GetBack />
      </div>
      <div className="border-2 rounded-xl container mx-auto max-h-[85%] h-[85%] mt-5 overflow-y-auto">
        <h3 className="font-bold text-xl pl-5 pt-2">Posted Jobs</h3>
        {user?.role === "Client" ? (
          applicants.map((m, idx: number) => (
            <div
              key={idx}
              onClick={() => {
                setParticularJobId(m._id);
                setIsModelOpen(true);
              }}
              className="m-4 p-4 border-2 cursor-pointer shadow-xl rounded-2xl flex flex-col gap-2 dark:bg-gray-900 "
            >
              <h2 className="font-bold text-lg">{m.title}</h2>
              <p className="line-clamp-3 mt-1 text-sm">{m.description}</p>
              <p className="text-sm dark:text-gray-400 mt-1">
                Budget:-{m.budget}$
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-1">
                {m.skills.slice(0, 5).map((m, idx: number) => (
                  <div
                    key={idx}
                    className="border-2 rounded-xl p-1 px-2 dark:bg-gray-500 dark:text-black"
                  >
                    {m}
                  </div>
                ))}
              </div>
              <p></p>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-screen h-screen">
            <p>You are not allowded to axis this page</p>
          </div>
        )}
      </div>

      {isModelOpne && (
        <div className="absolute z-100 top-0 left-0  h-screen w-screen bg-black/50 flex items-center justify-center px-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col gap-5 h-[85%]">
            <div className="flex flex-col gap-2">
              <div className="w-full flex justify-between">
                <h2 className="text-lg font-bold">Job Details</h2>
                <ImCross
                  onClick={() => setIsModelOpen(false)}
                  className="cursor-pointer"
                />
              </div>

              <hr className="bg-foreground/10" />
            </div>
            <div className="overflow-y-auto max-h-[85%] hide-scrollbar">
              {applicants.map(
                (m, idx: number) =>
                  m._id == particularJobId && (
                    <div key={idx} className="flex flex-col gap-4">
                      <h3 className="font-bold">{m.title}</h3>
                      <p>{m.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-1">
                        {m.skills.map((s: string, i: number) => (
                          <div
                            key={i}
                            className="border-2 rounded-xl p-1 px-2 dark:bg-gray-500 dark:text-black font-semibold"
                          >
                            {s}
                          </div>
                        ))}
                      </div>

                      <p>Budget:{m.budget}$</p>
                      <div>
                        {m.status ? (
                          <p>
                            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>{" "}
                            Online
                          </p>
                        ) : (
                          <p>
                            <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                            Offline
                          </p>
                        )}
                      </div>

                      <hr />

                      <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
                        {/* applicants */}
                        <h3 className="text-lg font-bold">Applicants</h3>
                  {m.applicants.length>0?        m.applicants.map((a, idx: number) => (
                          <div
                            key={idx}
                            className="dark:bg-gray-700 shadow-xl border-2 p-4 rounded-xl flex gap-5 items-center cursor-pointer justify-between"
                          >
                            <div
                              className="rounded-xl flex gap-5 items-center cursor-pointer "
                              onClick={() =>
                                router.push(
                                  `/profile/publicView/${a._id}-${a.role}`
                                )
                              }
                            >
                              <div>
                                <Image
                                  src={a.profilePicture}
                                  alt={a.name}
                                  width={50}
                                  height={50}
                                  className="rounded-full"
                                />
                              </div>

                              <div className="flex flex-col gap-2 ">
                                <p>Name: {a.name}</p>
                                <p>Experience: {a.Experience}Years</p>
                                <p className="flex flex-wrap">
                                  Profession:{" "}
                                  <span className="border-2 rounded-lg p-1 dark:bg-gray-500 dark:text-black font-semibold">
                                    {" "}
                                    {a.Proffession}
                                  </span>
                                </p>
                                <div className="flex flex-wrap gap-2 items-center">
                                  Skills:
                                  {a.Skills.slice(0, 5).map(
                                    (s, idx: number) => (
                                      <p
                                        key={idx}
                                        className="border-2 rounded-lg p-1 dark:bg-gray-500 dark:text-black font-semibold"
                                      >
                                        {s}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-5">
                              <button
                                className="bg-green-500 p-2 max-w-xl rounded-xl px-4"
                                onClick={() =>
                                  setCreateContactModal(
                                    `${m._id}-${a._id}-${m.budget}-${m.clientId}-${a.name}`
                                  )
                                }
                              >
                                Hire
                              </button>
                              {isRemoving ? (
                                <button
                                  disabled
                                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white flex items-center justify-center gap-2"
                                >
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                  </svg>
                                  Processing...
                                </button>
                              ) : (
                                <button
                                  className="bg-red-500 p-2 max-w-xl rounded-xl px-4"
                                  onClick={() => {


                              removeApplicants({freelancerId:a._id,jobId: m._id});
                                  }}
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>
                        )):(
                          <div>
                            <p>No applicants found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>

            {createContactModal.length > 0 && (
              <div className="fixed z-[200] inset-0 bg-black/50 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md transition-all duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Hire {createContactModal.split("-")[4]} ?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                    Are you sure you want to hire{" "}
                    <span className="font-medium">
                      {createContactModal.split("-")[4]}
                    </span>{" "}
                    for this job? This will create a contract and notify the
                    freelancer.
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 text-sm rounded-lg border dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setCreateContactModal("")}
                    >
                      Cancel
                    </button>
                    {isPending ? (
                      <button
                        disabled
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2"
                      >
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Processing...
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          const [jobId, freelancerId, budget, clientId] =
                            createContactModal.split("-");
                          createContact({
                            freelancerId,
                            jobId,
                            budget,
                            clientId,
                          });
                        }}
                      >
                        Hire Freelancer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Recent Applicants</h3>
      <div className="space-y-5 overflow-y-auto max-h-[400px]">
        {Array.isArray(applicants) && applicants.every(job => job.applicants.length === 0) ? (
         <div className="text-center text-gray-500 dark:text-gray-400">
           No applicants found.
         </div>
       ) : (
         Array.isArray(applicants) &&
         applicants.map((job, i:number) => (
           job.applicants.length > 0 && (
             <div
               key={i}
               className="pb-4 border-2 p-5 rounded-xl border-gray-100 dark:border-gray-700"
             >
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                 Job Title: <span className="font-medium">{job.title}</span>
               </p>
               {job.applicants.slice(0,2).map((applicant:Applicant, idx:number) => (
                 <div key={idx} className="flex items-center cursor-pointer gap-4 mb-3">
                   <div className="w-12 h-12 bg-gray-200  dark:bg-gray-700 rounded-full">
                     <Image
                       src={applicant.profilePicture}
                       alt={applicant.name}
                       width={50}
                       height={50}
                       className='rounded-full object-cover'
                     />
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900 dark:text-white">
                       {applicant.name}
                     </h4>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                       {applicant.email}
                     </p>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                       Applied 2h ago
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           )
         ))
       )}
     </div>
   </div> */}
        </div>
      )}
    </div>

    //
  );
};

export default Applicants;
