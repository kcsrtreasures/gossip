import express from "express"
import http from "http"
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5501",
            "https://kcsrtreasures.github.io",
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
});



export function getReceiverSocketId(userId) {
    return userSocketmap[userId]
}

// used to store online users
const userSocketmap = {} //{userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id)

    const userId = socket.handshake.query.userId
    if(userId) userSocketmap[userId] = socket.id

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketmap))

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id)
        delete userSocketmap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketmap))
    })
})

export { app, io, server }

