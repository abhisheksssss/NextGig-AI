import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const getDataFromToken=(request:NextRequest)=>{
try {
    const token = request.cookies.get("token")?.value || "";

    if(token === "") {
        throw new Error("No token found");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
return decodedToken.id;
} catch (error) {
    if(error instanceof Error) {
        console.error("Error decoding token:", error.message);
    }
}

}