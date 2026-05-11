import { ChannelModel } from '../models/Channel.js'
import { UserModel } from '../models/User.js'
export const channelHandler = (io, socket) => {
    // join channel room
    socket.on("channel:join", async ({ channelId }) => {
        try {
            const userId = socket.user?.id
            const channel = await ChannelModel.findById(channelId)
            if (!channel) {
                return socket.emit("error", { message: "Channel not found" })
            }
            if (!channel.members.map(m => m.toString()).includes(userId)) {
                return socket.emit("error", { message: "Not a member of this channel" })
            }
            socket.join(`channel:${channelId}`)
            // notify others in channel
            socket.to(`channel:${channelId}`).emit("channel:user_joined", {
                username: socket.user?.username,
                channelId
            })
            socket.emit("channel:joined", { message: `Joined channel`, channelId })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // leave channel room
    socket.on("channel:leave", async ({ channelId }) => {
        try {
            socket.leave(`channel:${channelId}`)
            socket.to(`channel:${channelId}`).emit("channel:user_left", {
                username: socket.user?.username,
                channelId
            })
            socket.emit("channel:left", { message: "Left channel", channelId })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // typing indicator start
    socket.on("channel:typing_start", ({ channelId }) => {
        socket.to(`channel:${channelId}`).emit("channel:typing", {
            username: socket.user?.username,
            isTyping: true,
            channelId
        })
    })
    // typing indicator stop
    socket.on("channel:typing_stop", ({ channelId }) => {
        socket.to(`channel:${channelId}`).emit("channel:typing", {
            username: socket.user?.username,
            isTyping: false,
            channelId
        })
    })
    // user status update (online/away/offline)
    socket.on("user:status", async ({ status }) => {
        try {
            const userId = socket.user?.id
            await UserModel.findByIdAndUpdate(userId, { status })
            // broadcast to all connected clients
            io.emit("user:status_updated", { userId, status })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
}