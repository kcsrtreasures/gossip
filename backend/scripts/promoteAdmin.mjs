import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";

dotenv.config()

const promoteAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        await User.findOneAndUpdate(
            { email: "kcsrdev@gmail.com" },
            { role: "admin" }
        )
        console.log("✅ User promoted to admin");
        process.exit(0);
    } catch (error) {
        console.error("❌ Promotion failed:", error);
        process.exit(1);
        
    }
}

promoteAdmin();


