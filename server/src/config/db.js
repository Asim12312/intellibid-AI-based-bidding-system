import mongoose from "mongoose"

// code to connect database using mongoose
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log("MongoDB connected");
    }
    catch (err) {
        console.error("MongoDB error: ", err);
        process.exit(1);
    }
}