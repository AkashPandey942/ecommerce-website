import mongoose, { Schema, Document } from "mongoose";

export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface IGeneration extends Document {
  userId: mongoose.Types.ObjectId;
  inputImage: string;
  modelId: string;
  background: string;
  outputStyle: string;
  prompt: string;
  status: GenerationStatus;
  requestId?: string; // RunComfy Request ID
  outputImage?: string; // RunComfy Output URL
  error?: string;
  createdAt: Date;
}

const GenerationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  inputImage: { type: String, required: true },
  modelId: { type: String, required: true },
  background: { type: String, required: true },
  outputStyle: { type: String, required: true },
  prompt: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["pending", "processing", "completed", "failed"], 
    default: "pending" 
  },
  requestId: { type: String },
  outputImage: { type: String },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Generation || mongoose.model<IGeneration>("Generation", GenerationSchema);
