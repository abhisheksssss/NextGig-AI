import { JobPostPayload } from "@/app/postJob/page";
import axiosInstance from "./axios";



export const createPost= async(formData:JobPostPayload)=>{
    const res = await axiosInstance.post("/api/postJob", formData);
    return res.data;
}



export const fetchJobs=async()=>{
    const res = await axiosInstance.get("api/jobs/genrateRecomandation")
    return res.data;
}



export const fetchJob=async(id:(string|null))=>{
    try {
        const res= await axiosInstance.get(`api/jobs/getJob/${id}`)
        console.log("This is Particualr job data",res.data.data)
        return res.data.data;
    } catch (error) {
        if(error instanceof Error){
            console.log(error.message)
        }
    }
}