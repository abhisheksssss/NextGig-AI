import mongoose, { model, models, Schema } from "mongoose";



export interface IPostJob extends mongoose.Document {
  clientId: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  status: boolean;
}



const postJobSchema= new Schema({
clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},
title:{
    type:String,
    required:true
},
description:{
type:String,
require:true
},
skills: {
    type: [String],
    required: true
},
budget:{
    type:Number,
    default:0
},
status:{
    type:Boolean,
    default:true
}



},{timestamps:true})


const postJob = models.PostJob || model("PostJob",postJobSchema)


export default postJob