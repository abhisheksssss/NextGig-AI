// import {Pinecone} from "@pinecone-database/pinecone";
// import { getTextEmbedding } from "./gemini.service";


// const pinecone= new Pinecone({
// apiKey: process.env.PINE_CONE!,
// environment: process.env.PINECONE_ENVIRONMENT || 'us-west4-gcp', // Use env for region
// })

// const index = pinecone.Index("talent-match");
// const EXPECTED_DIMENSIONS = 768; // For Gemini 1.5 Flash

// function assertDim(vec: number[]){
//     if(vec.length !== EXPECTED_DIMENSIONS){
//         throw new Error(`Vector dimension mismatch: expected ${EXPECTED_DIMENSIONS}, got ${vec.length}`)
//     }
// }


// // Freelancer

// export async function upsertFreelancer(freelancerId:string,textData:string){
//     const embedding= await getTextEmbedding(textData);
// assertDim(embedding);


// await index.namespace("freelancers").upsert([{id:freelancerId,values:embedding,metadata:{lastUpdated: new Date().toISOString()}}])

// }

// // jobs

// export async function upsertJobVector(jobId:string,textData:string){
// const embedding = await getTextEmbedding(textData);
// assertDim(embedding);


// await index.namespace("createJobs").upsert([{id:jobId,values:embedding,metadata:{lastUpdated: new Date().toISOString()}}])
// }


// // search 

// export async function findSimilarJobs(freelancerText:string,topK=5){
//     const embedding = await getTextEmbedding(freelancerText)
//     assertDim(embedding);

//     return index.namespace("jobs").query({vector:embedding,topK,includeMetadata:true})
// }


