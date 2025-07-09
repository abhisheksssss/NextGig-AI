import axiosInstance from "./axios";



export const fetchUser= async()=>{
    const res = await axiosInstance.get("/api/postJob");
    return res.data;
}