import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken=(request:NextRequest)=>{
try {
    const token = request.cookies.get("token")?.value || "";

    if(token === "") {
        throw new Error("No token found");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    
    if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
        return (decodedToken as jwt.JwtPayload).id;
    }

    return null;
    
} catch (error) {
    if(error instanceof Error) {
        console.error("Error decoding token:", error.message);
    }
}

}