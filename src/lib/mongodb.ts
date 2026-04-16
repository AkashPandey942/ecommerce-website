import mongoose from "mongoose";

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Set to true to handle race conditions during startup
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ [MongoDB] Connected to database.");
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // Hardening: Ensure the connection state is 'connected' (1) or 'connecting' (2)
    const state = mongoose.connection.readyState;
    if (state === 0) {
      console.warn("⚠️ [MongoDB] Connection was disconnected unexpectedly. Reconnecting...");
      cached.conn = null;
      cached.promise = null;
      return await dbConnect();
    }

  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
