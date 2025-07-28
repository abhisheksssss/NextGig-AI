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
        return res.data.data;
    } catch (error) {
        if(error instanceof Error){
            console.log(error.message)
        }
    }
}


export const getFreelancer=async()=>{
    try {
        const res= await axiosInstance.get("/api/client/genrateRecommandationForClient")
        console.log("Get freeelancer ",res.data.data)
return res.data.data
    } catch (error) {
console.log(error)        
    }
}


export const getAllUsers=async()=>{
try {
    const res=await axiosInstance.get("/api/auth/getUsers")
 
    return res.data.data
} catch (error) {
    console.log(error)
}
}

export const getAllMessage=async(user1:string | null,user2:string|null)=>{
    try {
        const res=await axiosInstance.get(`/api/chat?user1=${user1}&user2=${user2}`)
        return res.data.data;
    } catch (error) {
       console.log(error) 
    }
}

export const deleteChat=async(chatId:string|null)=>{
try {
    const res=await axiosInstance.delete(`/api/chat/deleteChat?deleteMessage=${chatId}`)
    return res.data.data;
} catch (error) {
    console.log(error)
}
}



export const updateChatWith=async(data:string|null)=>{
try {
    const res=await axiosInstance.put(`/api/chat/updatingChatWith`,{data})
    return res.data.data
} catch (error) {
    console.log(error)
}
}



export const updateChatWithOfOthers=async(data:string|null)=>{
try {
    const res=await axiosInstance.put(`/api/chat/updateChatWIthOfOtherUser`,{data})
    return res.data.data
} catch (error) {
    console.log(error)
}
}

export const applyForJob=async(data:string|null)=>{
    try {
        const res= await axiosInstance.put(`/api/jobs/applyForJob`,{data})
        return res.data.data
    } catch (error) {
        console.log(error)
    }
}


export const getApplicants=async()=>{
    try {
        const res= await axiosInstance.get(`/api/jobs/fetchApplicants`)
        return res.data.data
    } catch (error) {
        console.log(error)
    }
}



export const getParticularUserData=async(userId:string,userRole:string)=>{
    try {
        const res= await axiosInstance.get(`api/auth/getParticularUserData?userId=${userId}&userRole=${userRole}`)
        return res.data.data[0]
    } catch (error) {
        console.log(error)
    }
}

export const createContactApi = async (
  freelancerId: string,
  clientId: string,
  jobId: string,
  budget: string
) => {
  try {
    const res = await axiosInstance.post(`/api/createContect`, {
      freelancerId,
      clientId,
     projectId:jobId,
      budget,
    });
console.log(res.data?.data)
    return res.data?.data; // Safely access data
  } catch (error) {
    console.error("Error creating contract:", error);
    throw error;
  }
};


export const removeApplicant=async(freelancerId:string,jobId:string)=>{
try {
console.log(freelancerId)
console.log(jobId)

 const res= await axiosInstance.put(`/api/createContect/removeApplicant`,{
        freelancerId,
        jobId,
 })
 console.log(res.data)
return res.data?.data

} catch (error) {
    console.log(error)
}
}