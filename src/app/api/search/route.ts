import { mongoDBConncection } from "@/app/dbConfig/db";
import Client from "@/helper/model/Client.model";
import Freelancer from "@/helper/model/freelancer.model";
import PostJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";



export async function POST(request:NextRequest) {
    try {

        await mongoDBConncection();

          const data= await request.json();

        const{queryFromUser,queryType}=data;

if(!queryFromUser||!queryType){
    throw new Error("query and queryType are required");
}

const query= queryFromUser.trim();
const firstWordOfQUery=queryFromUser.charAt(0);

if(queryType==="Client"){
    const client= await Client.find({
        $or:[
            {name:{$regex:`${query}$`,$options:"i"}} , //Exact match
            {name:{$regex:`${query}`,$options:"i"}}  ,//Start With
            {name:{$regex:query,$options:"i"}},
              {name:{$regex:firstWordOfQUery,$options:"i"}}  
        ]
    }).limit(20).sort({ username: 1 })

if(client.length>0){
    return NextResponse.json({data:client},{status:200});
}
return NextResponse.json({data:[]},{status:200});
}
if(queryType==="Freelancer"){
    const client= await Freelancer.find({
        $or:[
            {name:{$regex:`${query}$`,$options:"i"}} , //Exact match
            {name:{$regex:`${query}`,$options:"i"}}  ,//Start With
            {name:{$regex:query,$options:"i"}} ,
              {name:{$regex:firstWordOfQUery,$options:"i"}} 
        ]
    }).limit(20).sort({ username: 1 })

if(client.length>0){
    return NextResponse.json({data:client},{status:200});
}
return NextResponse.json({data:[]},{status:200});
}
if(queryType==="Jobs"){
    const client= await PostJob.find({
        $or:[
            {title:{$regex:`${query}$`,$options:"i"}} , //Exact match
            {title:{$regex:`${query}`,$options:"i"}}  ,//Start With
            {title:{$regex:query,$options:"i"}}, 
            {title:{$regex:firstWordOfQUery,$options:"i"}} 
        ]
    }).limit(20).sort({ title: 1 })

if(client.length>0){
    return NextResponse.json({data:client},{status:200});
}
return NextResponse.json({data:[]},{status:200});
}

return NextResponse.json({data:"Wrong Job Type"},{status:400});
    } catch (error) {
        if(error instanceof Error){
            console.log(error)
            return NextResponse.json({error:error.message},{status:500})
        }
    }
}