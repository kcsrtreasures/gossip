import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"

import path from "path"

import { connectDB } from "./lib/db.js"
import { app, server } from "./lib/socket.js"
import authRoutes from "./routes/auth.route.js"
import cartRoutes from "./routes/cart.route.js"
import messageRoutes from "./routes/message.route.js"

dotenv.config()


const PORT = process.env.PORT
const __dirname = path.resolve()

const allowedOrigins = [
  // "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5501",
  "https://kcsrtreasures.github.io/breads/",
];

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS error: Not allowed - " + origin));
    }
  },
  credentials: true
}));

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

app.use("/api/cart", cartRoutes)


if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("/*splat", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

server.listen(PORT, "127.0.0.1", () => {
    console.log("Server is running at http://127.0.0.1:" + PORT)
    console.log("Server is running in PORT:" + PORT)
    connectDB()
})