import mongoose from 'mongoose'
import { config } from 'dotenv'
config()
export const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables")
        }
        console.log("Connecting to MongoDB...")
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected successfully")
    } catch (err) {
        console.error("CRITICAL: MongoDB connection failed")
        console.error("Error name:", err.name)
        console.error("Error message:", err.message)
        process.exit(1)
    }
}