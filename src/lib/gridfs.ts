import mongoose from "mongoose";
import dbConnect from "./mongodb";

// Accessing the GridFSBucket from Mongoose's internal driver to ensure version compatibility
let bucket: any | null = null;

/**
 * Gets or initializes the GridFS bucket for storing large files (images).
 * Uses Mongoose's internal MongoDB driver to prevent BSON version conflicts.
 */
export async function getGridFSBucket(): Promise<any> {
  const mongooseInstance = await dbConnect();
  const db = mongooseInstance.connection.db;

  if (!db) {
    console.log("⏳ [GridFS] Waiting for database connection to be fully ready...");
    return new Promise((resolve, reject) => {
      mongooseInstance.connection.once("open", () => {
        const openedDb = mongooseInstance.connection.db;
        if (!openedDb) {
          return reject(new Error("❌ [GridFS] DB object remains undefined after open event."));
        }
        // Using the MongoDB driver via Mongoose
        const GridFSBucket = mongoose.mongo.GridFSBucket;
        bucket = new GridFSBucket(openedDb, {
          bucketName: "fashion_uploads",
        });
        resolve(bucket);
      });
    });
  }

  if (!bucket) {
    const GridFSBucket = mongoose.mongo.GridFSBucket;
    bucket = new GridFSBucket(db, {
      bucketName: "fashion_uploads",
    });
  }

  return bucket;
}

/**
 * Uploads a buffer to GridFS and returns the file ID string.
 */
export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    const gridBucket = await getGridFSBucket();

    return new Promise((resolve, reject) => {
      const uploadStream = gridBucket.openUploadStream(filename, {
        contentType,
        metadata: {
          uploadDate: new Date(),
          source: "user_upload"
        }
      });

      uploadStream.on("error", (error: any) => {
        console.error("❌ [GridFS] Upload Stream Error:", error);
        reject(error);
      });

      uploadStream.on("finish", () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.end(buffer);
    });
  } catch (error: any) {
    console.error("❌ [GridFS] uploadToGridFS Catch:", error);
    throw new Error(`Storage error: ${error.message}`);
  }
}
