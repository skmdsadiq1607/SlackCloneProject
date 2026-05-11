import { CallModel } from '../models/Call.js'
export const callHandler = (io, socket) => {
    // initiator starts call — notify all invited participants
    socket.on("call:initiate", async ({ callId }) => {
        try {
            const call = await CallModel.findById(callId)
                .populate("initiatedBy", "username avatarUrl")
                .populate("participants.user", "username avatarUrl")
            if (!call) {
                return socket.emit("error", { message: "Call not found" })
            }
            // join the call room
            socket.join(`call:${callId}`)
            // notify each invited participant personally
            call.participants.forEach(p => {
                if (p.user._id.toString() !== socket.user?.id) {
                    io.to(`user:${p.user._id}`).emit("call:incoming", {
                        callId: call._id,
                        callType: call.callType,
                        callMode: call.callMode,
                        initiatedBy: call.initiatedBy
                    })
                }
            })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // invited user joins call room
    socket.on("call:join", async ({ callId }) => {
        try {
            const call = await CallModel.findById(callId)
            if (!call) {
                return socket.emit("error", { message: "Call not found" })
            }
            socket.join(`call:${callId}`)
            // notify all in call room that user joined
            io.to(`call:${callId}`).emit("call:user_joined", {
                callId,
                username: socket.user?.username,
                userId: socket.user?.id
            })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // user declines incoming call
    socket.on("call:decline", async ({ callId }) => {
        try {
            socket.to(`call:${callId}`).emit("call:user_declined", {
                callId,
                username: socket.user?.username,
                userId: socket.user?.id
            })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // user leaves call
    socket.on("call:leave", async ({ callId }) => {
        try {
            socket.leave(`call:${callId}`)
            io.to(`call:${callId}`).emit("call:user_left", {
                callId,
                username: socket.user?.username,
                userId: socket.user?.id
            })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // initiator ends call for everyone
    socket.on("call:end", async ({ callId }) => {
        try {
            io.to(`call:${callId}`).emit("call:ended", {
                callId,
                endedBy: socket.user?.username
            })
            // remove all sockets from call room
            const sockets = await io.in(`call:${callId}`).fetchSockets()
            sockets.forEach(s => s.leave(`call:${callId}`))
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })

    // ─── WebRTC Signaling ─────────────────────────────────────────────

    // send WebRTC offer to a specific user in the call
    socket.on("call:webrtc_offer", ({ callId, targetUserId, offer }) => {
        io.to(`user:${targetUserId}`).emit("call:webrtc_offer", {
            callId,
            fromUserId: socket.user?.id,
            fromUsername: socket.user?.username,
            offer
        })
    })
    // send WebRTC answer back to the caller
    socket.on("call:webrtc_answer", ({ callId, targetUserId, answer }) => {
        io.to(`user:${targetUserId}`).emit("call:webrtc_answer", {
            callId,
            fromUserId: socket.user?.id,
            answer
        })
    })
    // exchange ICE candidates between peers
    socket.on("call:ice_candidate", ({ callId, targetUserId, candidate }) => {
        io.to(`user:${targetUserId}`).emit("call:ice_candidate", {
            callId,
            fromUserId: socket.user?.id,
            candidate
        })
    })
    // toggle audio mute — broadcast to call room
    socket.on("call:mute_audio", ({ callId, isMuted }) => {
        socket.to(`call:${callId}`).emit("call:user_muted_audio", {
            userId: socket.user?.id,
            username: socket.user?.username,
            isMuted
        })
    })
    // toggle video — broadcast to call room
    socket.on("call:toggle_video", ({ callId, isVideoOff }) => {
        socket.to(`call:${callId}`).emit("call:user_toggled_video", {
            userId: socket.user?.id,
            username: socket.user?.username,
            isVideoOff
        })
    })
    // screen share started
    socket.on("call:screen_share_start", ({ callId }) => {
        socket.to(`call:${callId}`).emit("call:user_screen_sharing", {
            userId: socket.user?.id,
            username: socket.user?.username,
            isSharing: true
        })
    })
    // screen share stopped
    socket.on("call:screen_share_stop", ({ callId }) => {
        socket.to(`call:${callId}`).emit("call:user_screen_sharing", {
            userId: socket.user?.id,
            username: socket.user?.username,
            isSharing: false
        })
    })
}