import { JobPostPayload } from "@/app/postJob/page";
import axiosInstance from "./axios";



export const createPost= async(formData:JobPostPayload)=>{
    const res = await axiosInstance.post("/api/postJob", formData);
    return res.data;
}



export const fetchJobs=async()=>{
    const res = await axiosInstance.get("api/jobs/genrateRecomandation")
    console.log("THis is response .data in axios instance",res.data)
    return res.data;
}