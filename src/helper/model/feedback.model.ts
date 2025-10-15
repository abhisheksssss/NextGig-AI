import { model, models, Schema } from "mongoose";

const trackingSchema = new Schema(
  {
    freeLancerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Freelancer",
    },

    viewedJobs: [
      {
        jobId: { type: Schema.Types.ObjectId, ref: "PostJob" },
        viewedAt: { type: Date, default: Date.now }, // when the job was viewed
        duration: { type: Number, default: 0 }, // time spent on job (in seconds)
      },
    ],

    appliedJobs: [
      {
        jobId: { type: Schema.Types.ObjectId, ref: "PostJob" },
        appliedAt: { type: Date, default: Date.now },
      },
    ],

    savedJobs: [
      {
        jobId: { type: Schema.Types.ObjectId, ref: "PostJob" },
        savedAt: { type: Date, default: Date.now },
      },
    ],

    rejectedJobs: [
      {
        jobId: { type: Schema.Types.ObjectId, ref: "PostJob" },
        rejectedAt: { type: Date, default: Date.now },
      },
    ],

    searchHistoryOfFreelancer:{
      type: [String], // array of strings
  default: [],
    },

    sessionLogs: [
      {
        loginAt: { type: Date, default: Date.now },
        logoutAt: { type: Date },
        totalDuration: { type: Number, default: 0 }, // duration in minutes
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const Tracking = models.Tracking || model("Tracking", trackingSchema);
export default Tracking;
