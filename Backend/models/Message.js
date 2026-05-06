import { Schema, model } from 'mongoose'
const reactionSchema = new Schema({
    emoji: {
         type: String, required: true 
        },
    reactedBy: [{ 
        type: Schema.Types.ObjectId, ref: "user"
     }]
}, { 
    _id: false
 })
const messageSchema = new Schema({
    content: {
        type: String,
        default: ""
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Sender is required"]
    },
    channelId: {
        type: Schema.Types.ObjectId,
        ref: "channel",
        default: null
    },
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "conversation",
        default: null
    },
    threadId: {
        type: Schema.Types.ObjectId,
        ref: "thread",
        default: null
    },
    fileUrl: {
        type: String,
        default: ""
    },
    fileName: {
        type: String,
        default: ""
    },
    reactions: [reactionSchema],
    isEdited: {
        type: Boolean,
        default: false
    },
    isMessageActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})
export const MessageModel = model("message", messageSchema)