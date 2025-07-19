//mongoose is capable to connect mongodb

import mongoose  from "mongoose";
import "dotenv/config"
//we have to use this connect to connect to our database again and again 

if(!process.env.MONGO_URI){
    throw new Error("Please define the MONGO_URI environment variable inside .env file");
}


export async function mongoDBConncection(){
    try {
        mongoose.connect(process.env.MONGO_URI!);   //by using ! we are saying to type script that process.env.MONGO_URI is always define or i will take care of it 
  const connection= mongoose.connection;

  connection.on("connected",()=>{
    console.log("MongoDB connected successfully");       
  })
  connection.on("error",(err)=>{
    console.log("mongoDb connection error.Please make sure mongoDb is running"+err )
    process.exit();
  })

    } catch (error) {
        console.log("SOmething went Wrong in DB Connection");
        console.log(error);

    }
}


