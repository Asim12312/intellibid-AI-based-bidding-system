import mongoose from "mongoose"

// code to connect database using mongoose
export const connectDB = async () => {
    try {
        const uri =
            process.env.MONGODB_URI ||
            process.env.MONGO_URI ||
            process.env.MONGOURL ||
            'mongodb://127.0.0.1:27017/intellibid';
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    }
    catch (err) {
        console.error("MongoDB error: ", err);
        process.exit(1);
    }
}