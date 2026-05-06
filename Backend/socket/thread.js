import { MessageModel } from '../models/Message.js'
import { ThreadModel } from '../models/Thread.js'
export const threadHandler = (io, socket) => {
    // join thread room
    socket.on("thread:join", async ({ threadId }) => {
        try {
            const thread = await ThreadModel.findById(threadId)
            if (!thread) {
                return socket.emit("error", { message: "Thread not found" })
            }
            socket.join(`thread:${threadId}`)
            socket.emit("thread:joined", { threadId })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // leave thread room
    socket.on("thread:leave", ({ threadId }) => {
        socket.leave(`thread:${threadId}`)
        socket.emit("thread:left", { threadId })
    })
    // send thread reply via socket
    socket.on("thread:reply", async ({ parentMessageId, content, channelId }) => {
        try {
            const sender = socket.user?.id
            // find parent message
            const parentMsg = await MessageModel.findById(parentMessageId)
            if (!parentMsg) {
                return socket.emit("error", { message: "Parent message not found" })
            }
            // find or create thread
            let thread = await ThreadModel.findOne({ parentMessageId })
            if (!thread) {
                thread = new ThreadModel({ parentMessageId, channelId, createdBy: sender, replies: [] })
                await thread.save()
                parentMsg.threadId = thread._id
                await parentMsg.save()
            }
            // create reply message
            const replyMsg = new MessageModel({ content, sender, channelId, threadId: thread._id })
            await replyMsg.save()
            await replyMsg.populate("sender", "username avatarUrl")
            // push to thread replies
            thread.replies.push(replyMsg._id)
            await thread.save()
            // emit to thread room and channel room
            io.to(`thread:${thread._id}`).emit("thread:new_reply", { payload: replyMsg })
            io.to(channelId).emit("thread:reply_count_updated", {
                parentMessageId,
                threadId: thread._id,
                replyCount: thread.replies.length
            })
        } catch (err) {
            socket.emit("error", { message: err.message })
        }
    })
    // typing in thread
    socket.on("thread:typing_start", ({ threadId }) => {
        socket.to(`thread:${threadId}`).emit("thread:typing", {
            username: socket.user?.username,
            isTyping: true
        })
    })
    socket.on("thread:typing_stop", ({ threadId }) => {
        socket.to(`thread:${threadId}`).emit("thread:typing", {
            username: socket.user?.username,
            isTyping: false
        })
    })
}