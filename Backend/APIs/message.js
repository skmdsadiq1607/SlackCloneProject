import exp from 'express'
import { MessageModel } from '../models/Message.js'
import { ThreadModel } from '../models/Thread.js'
import { ChannelModel } from '../models/Channel.js'
import { verifyToken } from '../middleware/auth.js'
export const messageApp = exp.Router()
// Send message to channel
messageApp.post("/message/channel", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { content, channelId, fileUrl, fileName } = req.body
    const sender = req.user?.id
    // check user is member of channel
    const channel = await ChannelModel.findById(channelId)
    if (!channel || !channel.members.includes(sender)) {
        return res.status(403).json({ message: "Not a member of this channel" })
    }
    const newMessage = new MessageModel({ content, sender, channelId, fileUrl, fileName })
    await newMessage.save()
    res.status(201).json({ message: "Message sent", payload: newMessage })
})
// Get messages of a channel (with pagination)
messageApp.get("/messages/channel/:channelId", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { channelId } = req.params
    const { page = 1, limit = 30 } = req.query
    const messages = await MessageModel.find({ channelId, isMessageActive: true })
        .populate("sender", "username avatarUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
    res.status(200).json({ message: "Messages", payload: messages.reverse() })
})
// Edit message
messageApp.put("/message/:id", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const { content } = req.body
    const userId = req.user?.id
    const msg = await MessageModel.findOneAndUpdate(
        { _id: id, sender: userId, isMessageActive: true },
        { $set: { content, isEdited: true } },
        { new: true }
    )
    if (!msg) {
        return res.status(403).json({ message: "Not authorized to edit this message" })
    }
    res.status(200).json({ message: "Message updated", payload: msg })
})
// Soft delete message
messageApp.patch("/message/:id", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const userId = req.user?.id
    const msg = await MessageModel.findOne({ _id: id, sender: userId })
    if (!msg) {
        return res.status(403).json({ message: "Not authorized to delete this message" })
    }
    if (!msg.isMessageActive) {
        return res.status(200).json({ message: "Message already deleted" })
    }
    msg.isMessageActive = false
    await msg.save()
    res.status(200).json({ message: "Message deleted", payload: msg })
})
// Add/remove reaction to a message
messageApp.patch("/message/:id/react", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const { emoji } = req.body
    const userId = req.user?.id
    const msg = await MessageModel.findById(id)
    if (!msg) {
        return res.status(404).json({ message: "Message not found" })
    }
    // find if reaction with this emoji already exists
    const reactionIndex = msg.reactions.findIndex(r => r.emoji === emoji)
    if (reactionIndex === -1) {
        // new emoji reaction — add it
        msg.reactions.push({ emoji, reactedBy: [userId] })
    } else {
        const alreadyReacted = msg.reactions[reactionIndex].reactedBy.includes(userId)
        if (alreadyReacted) {
            // toggle off — remove user from reactedBy
            msg.reactions[reactionIndex].reactedBy = msg.reactions[reactionIndex].reactedBy
                .filter(u => u.toString() !== userId)
            // remove reaction if nobody reacted
            if (msg.reactions[reactionIndex].reactedBy.length === 0) {
                msg.reactions.splice(reactionIndex, 1)
            }
        } else {
            // add user to existing emoji
            msg.reactions[reactionIndex].reactedBy.push(userId)
        }
    }
    await msg.save()
    res.status(200).json({ message: "Reaction updated", payload: msg })
})
// Create thread reply
messageApp.post("/message/:id/thread", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params  // parent message id
    const { content, channelId } = req.body
    const sender = req.user?.id
    // check parent message exists
    const parentMsg = await MessageModel.findById(id)
    if (!parentMsg) {
        return res.status(404).json({ message: "Parent message not found" })
    }
    // find or create thread
    let thread = await ThreadModel.findOne({ parentMessageId: id })
    if (!thread) {
        thread = new ThreadModel({ parentMessageId: id, channelId, createdBy: sender, replies: [] })
        await thread.save()
        // link thread to parent message
        parentMsg.threadId = thread._id
        await parentMsg.save()
    }
    // create reply message
    const replyMsg = new MessageModel({ content, sender, channelId, threadId: thread._id })
    await replyMsg.save()
    // push reply to thread
    thread.replies.push(replyMsg._id)
    await thread.save()
    res.status(201).json({ message: "Reply sent", payload: replyMsg })
})
// Get thread replies
messageApp.get("/message/:id/thread", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const thread = await ThreadModel.findOne({ parentMessageId: id })
        .populate({ path: "replies", populate: { path: "sender", select: "username avatarUrl" } })
    if (!thread) {
        return res.status(200).json({ message: "No thread yet", payload: [] })
    }
    res.status(200).json({ message: "Thread replies", payload: thread.replies })
})