import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log("Incoming cookies:", req.cookies);

    let token;

    // 1. Try cookie first
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // 2. Fallback: Try Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 3. If still no token, block
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // 5. Fetch user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
