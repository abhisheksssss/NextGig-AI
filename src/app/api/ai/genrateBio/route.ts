// import { genrateContentAi } from "@/service/ai.service";
import { groqCalling } from "@/service/groq.service";
import { NextRequest, NextResponse } from "next/server";
// import removeMarkdown from "remove-markdown";




// export async function POST(request:NextRequest){
// try {
//     const body = await request.json();



// const{role,Proffession,Skills,Experience,HourlyRate,languages,ContactPreference}=body;


// if(!role || !Proffession || !Skills   || !Experience || !HourlyRate  || !languages  ||!ContactPreference){
//     return NextResponse.json({data:"Please enter data in form of fields"},{status:400})
// }

// const content= `genrate the short bio from this JSON data ${JSON.stringify(body)}`


// const genrateBioUsingApi= await genrateContentAi(content)


// if(genrateBioUsingApi){
// const plainText = removeMarkdown(genrateBioUsingApi);



// return NextResponse.json({data:plainText},{status:200})
// }

// return NextResponse.json({data:"error in fetching data from AI"},{status:400})

// } catch (error) {
//     console.log("Error in AI Bio",error)
//     return NextResponse.json({data:"Internal server error"},{status:500})
// }

// }


export async function POST(request:NextRequest){
    try {
    
    const body=await request.json();

    console.log(body)

    const response =await groqCalling(body.response)

    return NextResponse.json({data:response},{status:200})
            
    } catch (error) {
        if (error instanceof Error){
             console.log("Error in AI Bio",error)
    return NextResponse.json({data:"Internal server error"},{status:500})
        }
    }
}





