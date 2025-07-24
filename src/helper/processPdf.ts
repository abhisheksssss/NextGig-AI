import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import axios from "axios";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { Chunking } from "./textChunking";
import { queryEmbedding, textEmbedding } from "./textembedding";
import {pinecone} from "@/service/pinecone.service"
import { genrateContentAi } from "@/service/ai.service";
export async function processPdf() {

const tempPath= join(tmpdir(),`${uuidv4()}.pdf`)

    try {
        
const pdfUrl='https://res.cloudinary.com/dxhczwct9/raw/upload/v1752464169/resume/jxrh1yxxfpnvbgod79fw.pdf'

const response= await axios.get(pdfUrl,{responseType:"arraybuffer"})

await writeFile(tempPath,response.data)



    const loader = new PDFLoader(tempPath);
const docs= await loader.load()


if(!docs ||docs.length===0){
    throw new Error("No docs founded")
}

console.log("THis is the page docs",docs[0].pageContent)
const chunks:string[]=await Chunking(docs[0].pageContent)

const embeddedContent=await textEmbedding(chunks)


console.log("THis is the embedded content",embeddedContent)
const index=pinecone.index("nextgigchatbot")

//to insert vector



const vector = chunks.map((chunk,idx)=>({
    id:`chunks-${idx}`,
    values:embeddedContent[idx],
    metadata:{
        text:chunk,
        chunkIndex:idx
    }
}))



await index.upsert(vector)


const userQuestion="can you describe the email in communication"

const embeddedText = await queryEmbedding(userQuestion); 


const queryResult=await index.query({
    vector:embeddedText,
    topK:5,       //or higher
    includeMetadata:true
})

const relaventChunk=queryResult.matches.map(match=>match?.metadata?.text)

const context=relaventChunk.join("\n\n")

console.log("AI is thinking.......")
const aiResponse=await genrateContentAi(context,userQuestion)


console.log("AI responce",aiResponse)


    } catch (error) {
    if(error instanceof Error){
        console.error(error.message);
    }
    }finally{
         // Ignore if file doesn't exist
      try {
        await unlink(tempPath);
    
      } catch (error) {
        console.log(error)
      }  
    }


}