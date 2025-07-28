import { model, models, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IContract {
  _id?: Types.ObjectId;
  jobId: Types.ObjectId; // Reference to PostJob
  clientId: Types.ObjectId; // Reference to Client
  freelancerId: Types.ObjectId; // Reference to Freelancer
  amount: number;
  paymentIntentId: string;
  status: "pending" | "paid" | "cancelled";
  stripeTransferId?: string;
  isReleased: boolean;
  createdAt?: Date;
 updatedAt?: Date;
}



const contractSchema= new Schema({
    jobId:{
        type: Schema.Types.ObjectId,
        ref: 'PostJob',
    },
    clientId:{
        type:Schema.Types.ObjectId,
        ref:"Client"
    },
    freelancerId:{
        type:Schema.Types.ObjectId,
        ref:"Freelancer"
    },
    amount:{
        type:Number
    },
paymentIntentId:{
    type:String
},
status:{
type:String,
enum:["pending","paid","cancelled"],
default:"pending"
},
stripeTransferId:{
    type:String
},
  isReleased:{
type:Boolean
  } 

},{timestamps:true})


const Contract=  models.Contract ||model('Contract',contractSchema);


export default Contract