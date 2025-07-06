import mongoose, { Schema } from "mongoose";

export interface IClient extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    role: "Client";
    company?: string;
    Bio: string;
    Field:string[];
    ContactPreference: "Email" | "Chat";
    contactdetails: {
        email: string;
        phone?: string;
    }
    createdAt?: Date;
    updatedAt?: Date;   
    profilePicture?: string;
    location?: string;
}



const clientSchema= new Schema<IClient>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    name: {
        type: String,
        required: [true, "Please provide your name"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        match: [/.+\@.+\..+/, "please use a valid email address"]
    },
    role: {
        type: String,
        enum: ["Client"],
        default: "Client"
    },
    company: {
        type: String,
        default: ''
    },
    Bio: {
        type: String,
        default: ''
    },
    Field:{
        type:[String],
        default:[]
    },
    ContactPreference:{
        type:String,
        enum:["Email","Chat"],
        default:"Email"
    },
    contactdetails:{
        email:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            default:''
        }
    },
    profilePicture: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Client = mongoose.model<IClient>("Client", clientSchema);

export default Client;