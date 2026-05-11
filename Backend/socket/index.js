import { messageHandler } from './message.js'
import { channelHandler } from './channel.js'
import { dmHandler } from './dm.js'
import { threadHandler } from './thread.js'
import { callHandler } from './call.js'
import { UserModel } from '../models/User.js'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()

export const initSocket = (io) => {

    // socket auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token
            if (!token) {
                return next(new Error("Authentication required"))
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            
            // Check if user is still active
            const user = await UserModel.findById(decoded.id)
            if (!user || !user.isUserActive) {
                return next(new Error("User account is inactive or not found"))
            }

            socket.user = decoded
            next()
        } catch (err) {
            next(new Error("Invalid token"))
        }
    })

    io.on("connection", async (socket) => {
        const userId = socket.user?.id
        console.log(`User connected: ${socket.user?.username} [${socket.id}]`)

        // Update status to online
        await UserModel.findByIdAndUpdate(userId, { status: "online" })
        io.emit("user:status_changed", { userId, status: "online" })

        // join personal room for direct targeting (used by call:incoming)
        socket.join(`user:${userId}`)

        // register all handlers
        messageHandler(io, socket)
        channelHandler(io, socket)
        dmHandler(io, socket)
        threadHandler(io, socket)
        callHandler(io, socket)

        socket.on("disconnect", async () => {
            console.log(`User disconnected: ${socket.user?.username} [${socket.id}]`)
            
            // Wait a small bit to ensure socket leave completes
            const userSockets = await io.in(`user:${userId}`).fetchSockets()
            
            // Only update status to offline if this was the last active session
            if (userSockets.length === 0) {
                await UserModel.findByIdAndUpdate(userId, { status: "offline" })
                io.emit("user:status_changed", { userId, status: "offline" })
            }
        })
    })
}