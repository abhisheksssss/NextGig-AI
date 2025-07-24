import { CharacterTextSplitter } from "@langchain/textsplitters";

function chunkText(text:string,chukSize=600,overlap=80):string[]{
const chunks:string[]=[];
let i=0;
while(i<text.length){
    chunks.push(text.slice(i,i+chukSize));
    i+=chukSize-overlap;
}
return chunks;
}




export async function Chunking(largeText:string){
    console.log(largeText.length)
const textsplitters= new CharacterTextSplitter({
    chunkSize:500,
    chunkOverlap:0
})
const chunkstext = await textsplitters.splitText(largeText);

const text=chunkText(chunkstext[0])

return text

}