import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body ;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" })
        }

        const user = await User.findOne({email})

        if (user) return res.status(400).json({ message: "Email already exists" })
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser) {
            // generate jwt token here
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                role: "user",
            })

        } else {
            res.status(400).json({ message: "Invalid user data" })
        }

    } catch (error) {
        console.log("Error in the signup controller", error.message)
        res.status(500).json({ message: "Internal Server Error"})
        
    }
}

export const login = async (req, res) => {
    const { email, password, guestCart } = req.body
    const redirectUrl = req.query.redirect; // e.g., from ?redirect=https://kcsrtreasures.github.io/breads/


    try {
        const user = await User.findOne({email})

        if(!user) {
            return res.status(400).json({ message: "Invalid credentials."})
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials."})
        }

        const token =  generateToken(user._id, res)

        // ---- Merge guest cart into user's DB cart ----
        if (guestCart && Array.isArray(guestCart)) {
            let userCart = await Cart.findOne({ userId: user._id });
            if (!userCart) {
                userCart = new Cart({ userId: user._id, items: [] });
            }

            guestCart.forEach(guestItem => {
                const existingItem = userCart.items.find(i => i.productId.toString() === guestItem.productId);
                if (existingItem) {
                    existingItem.quantity += guestItem.quantity;
                } else {
                    userCart.items.push({
                        productId: guestItem.productId,
                        quantity: guestItem.quantity,
                        price: guestItem.price
                    });
                }
            });

            await userCart.save();
        }
        
        
        if (redirectUrl) {
            const safeUser = {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                isAdmin: user.role === "admin",
            };
            // console.log("safeUser sent to frontend:", safeUser);


            return res.send(`
            <html>
            <body>
            <script>
                window.opener.postMessage({
                type: "LOGIN_SUCCESS",
                user: JSON.parse('${JSON.stringify(safeUser).replace(/'/g, "\\'")}'),
                token: "${token}"
                }, "${new URL(redirectUrl).origin}");
                window.close();
            </script>
            <p>Login successful. You can close this window.</p>
            </body>
            </html>
            `);


        }

        res.status(200).json({
            _id:user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            isAdmin: user.role === "admin",
        })
    } catch (error) {
        console.log("Error in login credentials", error.message)
        res.status(500).json({ message: "Internal Server Error"})
    }

    
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0})
        res.status(200).json({ message: "Logged out successfully."})
    } catch (error) {
        console.log("Error in logout controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}  

export const updateProfile = async (req,res) => {
    try {
        const { profilePic } = req.body
        const userId = req.user._id

        if(!profilePic){
            return res.status(400).json({ message: "Profile pic is required."})
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, 
            { profilePic: uploadResponse.secure_url }, { new: true }
        )
        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in update profile.", error.message)
        res.status(500).json({ message: "Internal server error." })
    }
}

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller", error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
}