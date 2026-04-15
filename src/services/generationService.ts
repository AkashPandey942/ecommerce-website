// src/services/generationService.ts
import dbConnect from "@/lib/mongodb";
import Generation, { IGeneration, GenerationStatus } from "@/models/Generation";
import User from "@/models/User";

export const generationService = {
  /**
   * Creates a new generation job record in MongoDB.
   * Deducts credits from the user profile.
   */
  async createJob(userId: string, data: {
    inputImage: string;
    modelId: string;
    background: string;
    outputStyle: string;
    prompt: string;
    creditsCost?: number;
  }) {
    await dbConnect();
    
    // Deduct Credits (Secured on Backend)
    // Disabled for development to allow unlimited testing
    /*
    const cost = data.creditsCost || 10;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.credits < cost) {
      throw new Error("Insufficient credits");
    }
    user.credits -= cost;
    await user.save();
    */
    console.log(`🛠️ [dev] Skipping credit check for user ${userId}`);

    // 2. Create Job
    const job = await Generation.create({
      userId,
      ...data,
      status: "pending"
    });

    return job._id.toString();
  },

  /**
   * Updates a job's status and output.
   */
  async updateJob(jobId: string, updates: Partial<IGeneration>) {
    await dbConnect();
    await Generation.findByIdAndUpdate(jobId, updates);
  },

  /**
   * Fetches a single job.
   */
  async getJob(jobId: string) {
    await dbConnect();
    return await Generation.findById(jobId).lean();
  },

  /**
   * Refund credits for a failed job.
   */
  async refundJob(jobId: string) {
    await dbConnect();
    const job = await Generation.findById(jobId);
    if (!job || job.status === "failed") return; // Prevent double refund

    const user = await User.findById(job.userId);
    if (user) {
      user.credits += 10; // Assuming 10 is cost
      await user.save();
    }

    job.status = "failed";
    job.error = "Generation failed. Credits refunded.";
    await job.save();
  }
};
