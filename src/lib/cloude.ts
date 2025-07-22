import { Ifreelancer } from "@/helper/model/freelancer.model";
import {v2 as cloudinary} from "cloudinary"

export const getSignedResumeUrl = (user: Ifreelancer|null|undefined) => {
  if (user?.resumePdf) {
    const signedUrl = cloudinary.url(user.resumePdf, {
      resource_type: "raw",
      type: "authenticated",
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
    });

    return signedUrl;
  }

}