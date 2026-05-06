import { MessageModel } from '../models/Message.js'
import { ConversationModel } from '../models/Conversation.js'
export const dmHandler = (io, socket) => {
    // join DM conversation room
    socket.on("dm:join", async ({ conversationId }) => {
        try {
            const userId = socket.user?.id
            const conversation = await ConversationModel.findById(conversationId)
            if (!conversation) {
                return socket.emit("error", { message: "Conversation not found" })
            }
            // check user is a participant
            const isParticipant = conversation.participants
                .map(p => p.toString())
                .includes(userId)
            if (!isParticipant) {
                return socket.emit("error", { message: "Not authorized to join this conversation" })
            }
            socket.join(conversationId)
            socket.emit("dm:joined", { message: "Joined DM", conversationId })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // leave DM room
    socket.on("dm:leave", ({ conversationId }) => {
        socket.leave(conversationId)
        socket.emit("dm:left", { conversationId })
    })
    // send DM message via socket
    socket.on("dm:send", async ({ conversationId, content, fileUrl, fileName }) => {
        try {
            const sender = socket.user?.id
            const conversation = await ConversationModel.findById(conversationId)
            if (!conversation) {
                return socket.emit("error", { message: "Conversation not found" })
            }
            const isParticipant = conversation.participants
                .map(p => p.toString())
                .includes(sender)
            if (!isParticipant) {
                return socket.emit("error", { message: "Not authorized" })
            }
            // save message
            const newMessage = new MessageModel({ content, sender, conversationId, fileUrl, fileName })
            await newMessage.save()
            await newMessage.populate("sender", "username avatarUrl")
            // update lastMessage
            conversation.lastMessage = newMessage._id
            await conversation.save()
            // emit to both participants in room
            io.to(conversationId).emit("dm:new_message", { payload: newMessage })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // typing indicator in DM
    socket.on("dm:typing_start", ({ conversationId }) => {
        socket.to(conversationId).emit("dm:typing", {
            username: socket.user?.username,
            isTyping: true
        })
    })
    socket.on("dm:typing_stop", ({ conversationId }) => {
        socket.to(conversationId).emit("dm:typing", {
            username: socket.user?.username,
            isTyping: false
        })
    })
}