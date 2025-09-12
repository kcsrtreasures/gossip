import jwt from "jsonwebtoken";

export const generateToken=(userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn:"14d"
    })

    res.cookie("jwt",token,{
        maxAge: 14 * 24 * 60 * 60 * 1000,
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "None", // CSRF attacks cross-site request forgery attacks => change to "strict" for production
        secure: false // change to => {process.env.NODE_ENV !== "development"} for later use in development
    })

    return token;
}