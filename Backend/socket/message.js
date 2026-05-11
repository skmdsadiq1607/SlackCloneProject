import { MessageModel } from '../models/Message.js'
import { ChannelModel } from '../models/Channel.js'
export const messageHandler = (io, socket) => {
    // send message to channel
    socket.on("message:send", async ({ content, channelId, fileUrl, fileName }) => {
        try {
            const sender = socket.user?.id
            // check user is member
            const channel = await ChannelModel.findById(channelId)
            if (!channel || !channel.members.some(m => m.toString() === sender)) {
                return socket.emit("error", { message: "Not a member of this channel" })
            }
            const newMessage = new MessageModel({ content, sender, channelId, fileUrl, fileName })
            await newMessage.save()
            await newMessage.populate("sender", "username avatarUrl")
            // broadcast to all in channel room
            io.to(`channel:${channelId}`).emit("message:new", { payload: newMessage })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // edit message
    socket.on("message:edit", async ({ messageId, content }) => {
        try {
            const userId = socket.user?.id
            const msg = await MessageModel.findOneAndUpdate(
                { _id: messageId, sender: userId, isMessageActive: true },
                { $set: { content, isEdited: true } },
                { new: true }
            ).populate("sender", "username avatarUrl")
            if (!msg) {
                return socket.emit("error", { message: "Not authorized to edit" })
            }
            // broadcast edit to channel room
            io.to(`channel:${msg.channelId.toString()}`).emit("message:edited", { payload: msg })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // delete message (soft)
    socket.on("message:delete", async ({ messageId }) => {
        try {
            const userId = socket.user?.id
            const msg = await MessageModel.findOne({ _id: messageId, sender: userId })
            if (!msg) {
                return socket.emit("error", { message: "Not authorized to delete" })
            }
            msg.isMessageActive = false
            await msg.save()
            // broadcast delete to channel room
            io.to(`channel:${msg.channelId.toString()}`).emit("message:deleted", { messageId })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // react to message
    socket.on("message:react", async ({ messageId, emoji }) => {
        try {
            const userId = socket.user?.id
            const msg = await MessageModel.findById(messageId)
            if (!msg) {
                return socket.emit("error", { message: "Message not found" })
            }
            const reactionIndex = msg.reactions.findIndex(r => r.emoji === emoji)
            if (reactionIndex === -1) {
                msg.reactions.push({ emoji, reactedBy: [userId] })
            } else {
                const alreadyReacted = msg.reactions[reactionIndex].reactedBy
                    .map(id => id.toString())
                    .includes(userId)
                if (alreadyReacted) {
                    msg.reactions[reactionIndex].reactedBy = msg.reactions[reactionIndex].reactedBy
                        .filter(u => u.toString() !== userId)
                    if (msg.reactions[reactionIndex].reactedBy.length === 0) {
                        msg.reactions.splice(reactionIndex, 1)
                    }
                } else {
                    msg.reactions[reactionIndex].reactedBy.push(userId)
                }
            }
            await msg.save()
            // broadcast reaction update to channel room
            const roomId = msg.channelId ? `channel:${msg.channelId}` : `dm:${msg.conversationId}`
            io.to(roomId).emit("message:reacted", { payload: msg })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
}