import exp from 'express'
import { ChannelModel } from '../models/Channel.js'
import { verifyToken } from '../middleware/auth.js'
export const channelApp = exp.Router()
// Create channel
channelApp.post("/channel", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { name, description, isPrivate } = req.body
    const createdBy = req.user?.id
    // check if channel name already taken
    const existing = await ChannelModel.findOne({ name })
    if (existing) {
        return res.status(409).json({ message: "Channel name already exists" })
    }
    const newChannel = new ChannelModel({
        name, description, isPrivate,
        createdBy,
        members: [createdBy] // creator auto-joins
    })
    await newChannel.save()
    res.status(201).json({ message: "Channel created", payload: newChannel })
})
// Get all public channels
channelApp.get("/channels", verifyToken("USER", "ADMIN"), async (req, res) => {
    const channels = await ChannelModel.find({ isPrivate: false, isChannelActive: true })
        .populate("createdBy", "username avatarUrl")
    res.status(200).json({ message: "Channels", payload: channels })
})
// Get channels the logged-in user is a member of
channelApp.get("/channels/mine", verifyToken("USER", "ADMIN"), async (req, res) => {
    const userId = req.user?.id
    const channels = await ChannelModel.find({ members: userId, isChannelActive: true })
        .populate("members", "username avatarUrl status")
    res.status(200).json({ message: "My channels", payload: channels })
})
// Join a channel
channelApp.patch("/channel/:id/join", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const userId = req.user?.id
    const channel = await ChannelModel.findById(id)
    if (!channel) {
        return res.status(404).json({ message: "Channel not found" })
    }
    if (channel.isPrivate) {
        return res.status(403).json({ message: "Cannot join a private channel directly" })
    }
    if (channel.members.some(m => m.toString() === userId)) {
        return res.status(200).json({ message: "Already a member" })
    }
    channel.members.push(userId)
    await channel.save()
    res.status(200).json({ message: "Joined channel", payload: channel })
})
// Leave a channel
channelApp.patch("/channel/:id/leave", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const userId = req.user?.id
    const channel = await ChannelModel.findById(id)
    if (!channel) {
        return res.status(404).json({ message: "Channel not found" })
    }
    channel.members = channel.members.filter(m => m.toString() !== userId)
    await channel.save()
    res.status(200).json({ message: "Left channel", payload: channel })
})
// Soft delete channel (admin or creator)
channelApp.patch("/channel/:id", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const { isChannelActive } = req.body
    const userId = req.user?.id
    const channel = await ChannelModel.findById(id)
    if (!channel) {
        return res.status(404).json({ message: "Channel not found" })
    }
    // only creator or admin can deactivate
    if (channel.createdBy.toString() !== userId && req.user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" })
    }
    if (channel.isChannelActive === isChannelActive) {
        return res.status(200).json({ message: "Channel already in same state" })
    }
    channel.isChannelActive = isChannelActive
    await channel.save()
    res.status(200).json({ message: "Channel updated", payload: channel })
})

// Invite user to channel
channelApp.post("/channel/:id/invite", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const { userId } = req.body
    const requesterId = req.user?.id

    const channel = await ChannelModel.findById(id)
    if (!channel) {
        return res.status(404).json({ message: "Channel not found" })
    }

    // verify requester is a member
    if (!channel.members.some(m => m.toString() === requesterId)) {
        return res.status(403).json({ message: "Only members can invite others" })
    }

    if (channel.members.some(m => m.toString() === userId)) {
        return res.status(400).json({ message: "User is already a member" })
    }

    channel.members.push(userId)
    await channel.save()
    res.status(200).json({ message: "User invited successfully", payload: channel })
})

// Get channel members
channelApp.get("/channel/:id/members", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { id } = req.params
    const channel = await ChannelModel.findById(id).populate("members", "username avatarUrl status")
    if (!channel) {
        return res.status(404).json({ message: "Channel not found" })
    }
    res.status(200).json({ message: "Channel members", payload: channel.members })
})