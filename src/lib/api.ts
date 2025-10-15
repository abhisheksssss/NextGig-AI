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


export const fetchContactDetails=async(projectId:string)=>{
    try {
        const res= await axiosInstance.get(`/api/createContect/getContactDetails?projectId=${projectId}`)
        return res?.data?.data
    } catch (error) {
        console.log(error)
    }
}


export const fetchContacts=async(userId:string,role:string)=>{
    try {
        const res= await axiosInstance.get(`/api/createContect/fetchUserContects?_Id=${userId}&role=${role}`)
        
             return res?.data?.data
    } catch (error) {
          console.log(error)
    }
}


export const fetchGoogleData=async(query:string)=>{

    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY;
  const SEARCH_ENGINE_ID = process.env.NEXT_PUBLIC_GOOGLE_CX;

   if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
        throw new Error('Missing API key or Search Engine ID');
      }

      try {
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${SEARCH_ENGINE_ID}&key=${GOOGLE_API_KEY}`;
        console.log('Request URL:', url); // Debug log
        
        const res = await fetch(url);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Response:', errorText); // Debug log
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        if (data.error) {
          console.error('API Error Response:', data.error); // Debug log
          throw new Error(data.error.message || 'Google API Error');
        }

        return data;
      } catch (err) {
        console.error('Google Search Error:', err);
        throw err;
      } 
}

export  const getWebSearchData=async(query:string|string[],queryType:string|string[])=>{
    try {
        const res= await axiosInstance.get(`/api/search?query=${query}&queryType=${queryType}`) 
        return res.data.data
    } catch (error) {
        console.log(error)
    }
}

export const updateViewData=async(freelancerId: string,
  jobId: string,
  duration: number)=>{
    try {
        const res= await axiosInstance.post("/api/tracking/view",{
freelancerId,
jobId,
duration
        })
        return res?.data?.message
    } catch (error) {
        console.log(error)
    }
}


export const updateRejectData=async(freelancerId:string,jobId:string)=>{
try {
    const res= await axiosInstance.post("/api/tracking/rejectedJobs",{
        freelancerId,
        jobId
    })

    return res?.data?.message
} catch (error) {
    console.log(error)
}
}