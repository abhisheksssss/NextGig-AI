import { NextResponse } from "next/server"



export async function GET() {
    try {
        const response= NextResponse.json({
            message:"LogOut  successfully",
            success:true
        })

response.cookies.set("token","",{
    httpOnly:true,
    expires:new Date(0),
    path:"/"
})
return response
    } catch (error) {
        if(error instanceof Error)
         return NextResponse.json({ error: error.message }, { status: 500 });
    }

}