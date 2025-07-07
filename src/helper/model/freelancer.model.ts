import mongoose, { Schema } from "mongoose";


export interface Ifreelancer {
    userId: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    role: "Freelancer";
    Proffession: string;
    Skills: string[];
    Experience: number;
    HourlyRate: number;
    Portfolio: string[];
    Availability: "Full-time" | "Part-time" | "Freelance";
    Bio: string;
    languages: string[];
    ContactPreference: "Email" | "Chat";
    contactdetails: {
        email: string;
        phone?: string;
    };
    profileVisibility: "Public" | "Private";
    profilePicture?: string;
    location?: string;
    createdAt?: Date;
    updatedAt?: Date;
    resumePdf?:string;
}



const FreelancerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId,
         ref: "User" },
name:{
    type:String,
    required:[true,"Please provide your name"]
},
email: {  
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    match: [/.+\@.+\..+/, "please use a valid email address"]
},
role:{
    type:String,
},
Proffession:{
    type:String,
    default:""
},
Skills:{
    type:[String],
    default:[]
},
Experience:{
    type:Number,
    default:0
},
HourlyRate:{
    type:Number,
    default:0
},
Portfolio: {
    type: [String],
    default: []
},
Availability: {
    type: String,
    enum: ["Full-time", "Part-time", "Freelance"],
    default: "Freelance"
},
Bio: {
    type: String,
    default: ''
},
languages: {
    type: [String],
    default: []
},
ContactPreference: {
    type: String,
    enum: ["Email", "Chat"],
    default: "Email"
},
contactdetails: {
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    }
},
profileVisibility: {
    type: String,
    enum: ["Public", "Private"],
    default: "Public"
},
profilePicture: {
    type: String,
    default: ''
},
location: {
    type: String,
    default: ''
},resumePdf:{
    type:String,
    default:""
}
}, { timestamps: true });



const Freelancer = mongoose.model<Ifreelancer>("Freelancer", FreelancerSchema);

export default Freelancer;