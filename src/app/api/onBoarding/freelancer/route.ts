import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import cloudinary from "@/lib/cloudinary";
import { mongoDBConncection } from "@/app/dbConfig/db";
import { Readable } from "stream";
import os from "os";
import Freelancer from "@/helper/model/freelancer.model";
import Client from "@/helper/model/Client.model";
import User from "@/helper/model/user.model";
// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Convert web stream to Node.js stream

function fullyNormalizeFields(
  fields: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in fields) {
    const val = Array.isArray(fields[key]) ? fields[key][0] : fields[key];

    try {
      // Try parsing JSON (for objects or arrays)
      const parsed = JSON.parse(val);
      result[key] = parsed;
    } catch {
      // If not JSON, just use string value
      result[key] = val;
    }
  }

  return result;
}

function streamToNodeReadable(
  stream: ReadableStream<Uint8Array>
): NodeJS.ReadableStream {
  const reader = stream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(Buffer.from(value));
    },
  });
}

export async function POST(request: NextRequest) {
  await mongoDBConncection();

  try {
    const nodeRequest = streamToNodeReadable(request.body!);

    // Set headers manually (formidable expects these)
    (nodeRequest as any).headers = Object.fromEntries(
      request.headers.entries()
    );

    const form = new IncomingForm({
      multiples: true,
      uploadDir: os.tmpdir(),
      keepExtensions: true,
    });

    const data: any = await new Promise((resolve, reject) => {
      form.parse(nodeRequest as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = data;
    console.log("This is field and fiels", { fields, files });
    const resume = Array.isArray(files.resumePdf)
      ? files.resumePdf[0]
      : files.resumePdf;
    const image = Array.isArray(files.profilePicture)
      ? files.profilePicture
      : files.profilePicture;

    if (!image || !fields) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const body = fullyNormalizeFields(fields);
    console.log("This is the body data", body);

    if (body.role === "Freelancer") {
      if (
        !resume?.mimetype ||
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(resume.mimetype)
      ) {
        return NextResponse.json(
          { error: "Resume must be a PDF or DOCX" },
          { status: 400 }
        );
      }
    }

    if (!image[0]?.mimetype || !image[0].mimetype.startsWith("image/")) {
      return NextResponse.json(
        { error: "Profile picture must be an image" },
        { status: 400 }
      );
    }

    function getResourceType(mime: string): "image" | "video" | "raw" {
      if (!mime) return "raw";
      if (mime.startsWith("image/")) return "image";
      if (mime.startsWith("video/")) return "video";
      return "raw";
    }

    let resumeurl = null;

    if (body.role === "Freelancer") {
      const uploadedResume = await cloudinary.uploader.upload(resume.filepath, {
        resource_type: getResourceType(resume.mimetype),
        folder: "resume",
      });

      resumeurl = uploadedResume;
      fs.unlinkSync(resume.filepath);
    }

    const uploadedImage = await cloudinary.uploader.upload(image[0].filepath, {
      resource_type: getResourceType(image[0].mimetype),
      folder: "profile_picture",
    });

    fs.unlinkSync(image[0].filepath);

    const parsedFields = Object.fromEntries(
      Object.entries(body).map(([key, val]) => [
        key,
        Array.isArray(val) ? val[0] : val,
      ])
    );

    console.log("THis is what we are getting", parsedFields);

    if (parsedFields.role === "Freelancer") {
      const profile = await Freelancer.create({
        ...parsedFields,
        resumePdf: resumeurl?.secure_url,
        profilePicture: uploadedImage.secure_url,
      });

      if (profile) {
        const setOnBoardingTrue = await User.findByIdAndUpdate(
          parsedFields.userId,
          { onBoarding: true },
          { new: true } // optional: returns the updated document
        );
      }else{
        console.log("Problem in getting progile")
      }

      return NextResponse.json({ data: profile }, { status: 201 });
    }

    if (parsedFields.role === "Client") {
      const profile = await Client.create({
        ...parsedFields,
        profilePicture: uploadedImage.secure_url,
      });
      if (profile) {
        const setOnBoardingTrue = await User.findByIdAndUpdate(
          parsedFields.userId,
          { onBoarding: true },
          { new: true } // optional: returns the updated document
        );
      }else{
        console.log("problem in getting progile in Client")
      }

      return NextResponse.json({ data: profile }, { status: 201 });
    }

    return NextResponse.json({ message: "Upbording failed" }, { status: 400 });
  } catch (error) {
    console.error("Error uploading:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
