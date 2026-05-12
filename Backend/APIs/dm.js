import exp from 'express'
import { MessageModel } from '../models/Message.js'
import { ConversationModel } from '../models/Conversation.js'
import { UserModel } from '../models/User.js'
import { verifyToken } from '../middleware/auth.js'
export const dmApp = exp.Router()
// Start or get DM conversation
dmApp.post("/dm/:receiverId", verifyToken("USER", "ADMIN"), async (req, res) => {
    const senderId = req.user?.id
    const { receiverId } = req.params
    // check receiver exists
    const receiver = await UserModel.findById(receiverId)
    if (!receiver) {
        return res.status(404).json({ message: "User not found" })
    }
    // find existing conversation between both users
    let conversation = await ConversationModel.findOne({
        participants: { $all: [senderId, receiverId] }
    })
    if (!conversation) {
        conversation = new ConversationModel({ participants: [senderId, receiverId] })
        await conversation.save()
    }
    res.status(200).json({ message: "Conversation", payload: conversation })
})
// Get all DM conversations of logged-in user
dmApp.get("/dms", verifyToken("USER", "ADMIN"), async (req, res) => {
    const userId = req.user?.id
    const conversations = await ConversationModel.find({ participants: userId, isActive: true })
        .populate("participants", "username avatarUrl status")
        .populate("lastMessage")
        .sort({ updatedAt: -1 })
    res.status(200).json({ message: "DM conversations", payload: conversations })
})
// Get messages of a DM conversation
dmApp.get("/dm/:conversationId/messages", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { conversationId } = req.params
    const userId = req.user?.id
    const { page = 1, limit = 30 } = req.query
    // verify user is part of conversation
    const conversation = await ConversationModel.findById(conversationId)
    if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
        return res.status(403).json({ message: "Not authorized to view this conversation" })
    }
    const messages = await MessageModel.find({ conversationId, isMessageActive: true })
        .populate("sender", "username avatarUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
    res.status(200).json({ message: "DM Messages", payload: messages.reverse() })
})
// Send DM message
dmApp.post("/dm/:conversationId/message", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { conversationId } = req.params
    const sender = req.user?.id
    const { content, fileUrl, fileName } = req.body
    // verify user is part of conversation
    const conversation = await ConversationModel.findById(conversationId)
    if (!conversation || !conversation.participants.some(p => p.toString() === sender)) {
        return res.status(403).json({ message: "Not authorized" })
    }
    // create message
    const newMessage = new MessageModel({ content, sender, conversationId, fileUrl, fileName })
    await newMessage.save()
    await newMessage.populate("sender", "username avatarUrl")
    
    // update lastMessage in conversation
    conversation.lastMessage = newMessage._id
    await conversation.save()

    // broadcast to conversation room
    const io = req.app.get("io")
    io.to(`dm:${conversationId}`).emit("dm:new", { payload: newMessage })

    // also notify participants to update their conversation list (sidebar)
    conversation.participants.forEach(p => {
        io.to(`user:${p}`).emit("conversation:updated", { payload: conversation })
    })
    res.status(201).json({ message: "DM sent", payload: newMessage })
})