import { NextRequest, NextResponse } from "next/server";
import {IncomingForm} from "formidable";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";
import { mongoDBConncection } from "@/app/dbConfig/db";
import User from "@/helper/model/user.model";
import { Ifreelancer } from "@/helper/model/freelancer.model";


export const config={
    api:{
        bodyParser: false
    },
};



export async function POST(request:NextRequest) {
await mongoDBConncection();
try {
const form = new IncomingForm({
    multiples:true, // allow multiple files per fields (even if we use one)
    uploadDir:"/tmp", //temporay directory to save the files before upload
    keepExtensions:true, //keep the original files extension 
})

const data:any = await new Promise((resolve,reject)=>{
form.parse(request as any, (err, fields, files) =>{
    if(err) reject(err); // if there's a parsing error, reject the promise
        resolve({fields,files}); // otherwise, resolve with parsed data
})
})



const resume = data.files.resume?.[0];
const image= data.files.image?.[0];


    
       const body=data.fields;

console.log(body)


if(!resume || !image || !body) {
return NextResponse.json({error:"Missing fields"},{status:400})
}

// const {userId,name,email,role,Proffession,Skills,Experience,HourlyRate,portfolio,Availability,Bio,languages,ContactPreference,contactdetails,profileVisibility,location}=body;

const uploadeResume = await cloudinary.uploader.upload(resume.filePath, {
    resource_type:"raw",  //since it is pdf
    folder:"resume" //place it in the image folder on cloudinary
})

const uploadeImage= await cloudinary.uploader.upload(image.filePath,{
    resource_type:"image",
    folder:"image" //place it in the image folder on cloudinary
})

fs.unlinkSync(resume.filePath);
fs.unlinkSync(image.filepath)

const profile = await User.create({
    body,
    resumePdf:uploadeResume.secure_url,
    profilePicture:uploadeImage.secure_url

})

    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal server error"},{status:500})
    }

}