import { JobFormData } from "@/app/postJob/page";
import axiosInstance from "./axios";



export const createPost= async(formData:JobFormData)=>{
    const res = await axiosInstance.post("/api/postJob", formData);
    console.log("Response from createPost:", res.data);
    return res.data;
}



