import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,    
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        profilePic: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isAdmin: { 
            type: Boolean, 
            default: false 
        },
        
        
        
        // resetPasswordToken: String,
        // resetPasswordExpires: Date,

    },
    { timestamps: true }
)

const User = mongoose.model("User", userSchema)

export default User;