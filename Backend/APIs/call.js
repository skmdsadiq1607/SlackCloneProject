import exp from 'express'
import { CallModel } from '../models/Call.js'
import { ConversationModel } from '../models/Conversation.js'
import { ChannelModel } from '../models/Channel.js'
import { verifyToken } from '../middleware/auth.js'
export const callApp = exp.Router()
// initiate a call
callApp.post("/call", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { callType, callMode, conversationId, channelId } = req.body
    const initiatedBy = req.user?.id
    if (callMode === "dm") {
        // verify conversation exists and user is participant
        const conversation = await ConversationModel.findById(conversationId)
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" })
        }
        const isParticipant = conversation.participants
            .map(p => p.toString())
            .includes(initiatedBy)
        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized" })
        }
        // build participants list from conversation (excluding caller)
        const otherParticipants = conversation.participants
            .filter(p => p.toString() !== initiatedBy)
            .map(p => ({ user: p, status: "invited" }))

        const newCall = new CallModel({
            callType, callMode, initiatedBy, conversationId,
            participants: [
                { user: initiatedBy, status: "joined", joinedAt: new Date() },
                ...otherParticipants
            ]
        })
        await newCall.save()
        await newCall.populate("initiatedBy", "username avatarUrl")
        return res.status(201).json({ message: "Call initiated", payload: newCall })
    }

    if (callMode === "channel") {
        // verify channel exists and user is member
        const channel = await ChannelModel.findById(channelId)
        if (!channel) {
            return res.status(404).json({ message: "Channel not found" })
        }
        const isMember = channel.members.map(m => m.toString()).includes(initiatedBy)
        if (!isMember) {
            return res.status(403).json({ message: "Not a member of this channel" })
        }
        // all channel members are invited
        const otherMembers = channel.members
            .filter(m => m.toString() !== initiatedBy)
            .map(m => ({ user: m, status: "invited" }))

        const newCall = new CallModel({
            callType, callMode, initiatedBy, channelId,
            participants: [
                { user: initiatedBy, status: "joined", joinedAt: new Date() },
                ...otherMembers
            ]
        })
        await newCall.save()
        await newCall.populate("initiatedBy", "username avatarUrl")
        return res.status(201).json({ message: "Call initiated", payload: newCall })
    }

    res.status(400).json({ message: "Invalid call mode" })
})

// join a call
callApp.patch("/call/:callId/join", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { callId } = req.params
    const userId = req.user?.id
    const call = await CallModel.findById(callId)
    if (!call) {
        return res.status(404).json({ message: "Call not found" })
    }
    if (call.status === "ended") {
        return res.status(400).json({ message: "Call has already ended" })
    }
    // find participant entry
    const participantIndex = call.participants.findIndex(
        p => p.user.toString() === userId
    )
    if (participantIndex === -1) {
        return res.status(403).json({ message: "Not invited to this call" })
    }
    // update participant status
    call.participants[participantIndex].status = "joined"
    call.participants[participantIndex].joinedAt = new Date()
    // mark call as ongoing when first invited user joins
    if (call.status === "ringing") {
        call.status = "ongoing"
        call.startedAt = new Date()
    }
    await call.save()
    res.status(200).json({ message: "Joined call", payload: call })
})
// decline a call
callApp.patch("/call/:callId/decline", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { callId } = req.params
    const userId = req.user?.id
    const call = await CallModel.findById(callId)
    if (!call) {
        return res.status(404).json({ message: "Call not found" })
    }
    const participantIndex = call.participants.findIndex(
        p => p.user.toString() === userId
    )
    if (participantIndex === -1) {
        return res.status(403).json({ message: "Not invited to this call" })
    }
    call.participants[participantIndex].status = "declined"
    // if all invited users declined — mark call as missed
    const allDeclined = call.participants
        .filter(p => p.user.toString() !== call.initiatedBy.toString())
        .every(p => p.status === "declined")
    if (allDeclined) {
        call.status = "missed"
        call.endedAt = new Date()
    }
    await call.save()
    res.status(200).json({ message: "Call declined", payload: call })
})
// leave a call
callApp.patch("/call/:callId/leave", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { callId } = req.params
    const userId = req.user?.id
    const call = await CallModel.findById(callId)
    if (!call) {
        return res.status(404).json({ message: "Call not found" })
    }
    const participantIndex = call.participants.findIndex(
        p => p.user.toString() === userId
    )
    if (participantIndex === -1) {
        return res.status(403).json({ message: "Not part of this call" })
    }
    call.participants[participantIndex].status = "missed"
    call.participants[participantIndex].leftAt = new Date()
    // check if all participants have left — end call
    const allLeft = call.participants.every(
        p => p.status === "missed" || p.status === "declined"
    )
    if (allLeft) {
        call.status = "ended"
        call.endedAt = new Date()
        if (call.startedAt) {
            call.duration = Math.floor((call.endedAt - call.startedAt) / 1000)
        }
    }
    await call.save()
    res.status(200).json({ message: "Left call", payload: call })
})
// end call — initiator only
callApp.patch("/call/:callId/end", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { callId } = req.params
    const userId = req.user?.id
    const call = await CallModel.findById(callId)
    if (!call) {
        return res.status(404).json({ message: "Call not found" })
    }
    if (call.initiatedBy.toString() !== userId) {
        return res.status(403).json({ message: "Only the initiator can end the call" })
    }
    if (call.status === "ended") {
        return res.status(400).json({ message: "Call already ended" })
    }
    call.status = "ended"
    call.endedAt = new Date()
    if (call.startedAt) {
        call.duration = Math.floor((call.endedAt - call.startedAt) / 1000)
    }
    // mark all still-joined participants as left
    call.participants.forEach(p => {
        if (p.status === "joined") {
            p.status = "missed"
            p.leftAt = new Date()
        }
    })
    await call.save()
    res.status(200).json({ message: "Call ended", payload: call })
})
// get call history (DM or channel)
callApp.get("/calls", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { conversationId, channelId, page = 1, limit = 20 } = req.query
    const filter = {}
    if (conversationId) filter.conversationId = conversationId
    if (channelId) filter.channelId = channelId
    const calls = await CallModel.find(filter)
        .populate("initiatedBy", "username avatarUrl")
        .populate("participants.user", "username avatarUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
    res.status(200).json({ message: "Call history", payload: calls })
})
// get single call details
callApp.get("/call/:callId", verifyToken("USER", "ADMIN"), async (req, res) => {
    const { callId } = req.params
    const call = await CallModel.findById(callId)
        .populate("initiatedBy", "username avatarUrl")
        .populate("participants.user", "username avatarUrl")
    if (!call) {
        return res.status(404).json({ message: "Call not found" })
    }
    res.status(200).json({ message: "Call details", payload: call })
})