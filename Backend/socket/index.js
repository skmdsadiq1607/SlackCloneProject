import { messageHandler } from './message.js'
import { channelHandler } from './channel.js'
import { dmHandler } from './dm.js'
import { threadHandler } from './thread.js'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()
export const initSocket = (io) => {
    // socket auth middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token
            if (!token) {
                return next(new Error("Authentication required"))
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            socket.user = decoded
            next()
        } catch (err) {
            next(new Error("Invalid token"))
        }
    })
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user?.username} [${socket.id}]`)
        // register all handlers
        messageHandler(io, socket)
        channelHandler(io, socket)
        dmHandler(io, socket)
        threadHandler(io, socket)
        // disconnect
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.user?.username} [${socket.id}]`)
        })
    })
}