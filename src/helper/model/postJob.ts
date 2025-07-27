import mongoose, { model, models, Schema } from "mongoose";
import "./Client.model";


export interface IPostJob extends mongoose.Document {
  clientId:Schema.Types.ObjectId;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  status: boolean;
  applicants:Schema.Types.ObjectId[];
}




const postJobSchema= new Schema({
clientId:{
    type:Schema.Types.ObjectId,
    ref:"Client"
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
},
applicants:[{
    type:Schema.Types.ObjectId,
    ref:"Freelancer",
    default:""
}]



},{timestamps:true})


const PostJob = models.PostJob || model("PostJob",postJobSchema)


export default PostJob