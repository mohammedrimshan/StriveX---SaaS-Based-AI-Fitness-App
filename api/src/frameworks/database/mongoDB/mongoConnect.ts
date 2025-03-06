import mongoose from "mongoose";
import { config } from "../../../shared/config";

export class MongoConnect {
  private _dbUrl: string;
  
  constructor() {
    this._dbUrl = config.database.URI;
    console.log("🔍 MongoDB URI:", this._dbUrl);
  }
  
  async connectDB() {
    try {
      await mongoose.connect(this._dbUrl);
      console.log("🟢 Database connected successfully!");
      
      mongoose.connection.on("error", (error) => {
        console.error("❌ MongoDB connection error:", error);
      });
      
      mongoose.connection.on("disconnected", () => {
        console.log("🔌 MongoDB disconnected");
      });
    } catch (error) {
      console.error("💥 Failed to connect to MongoDB:", error);
      throw new Error("Database connection failed");
    }
  }
  
  async disconnectDB() {
    try {
      await mongoose.disconnect();
      console.log("👋 Database disconnected successfully");
    } catch (error) {
      console.error("⚠️ Error disconnecting from MongoDB:", error);
    }
  }
}