import { Schema, model } from 'mongoose'
const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Participants are required"]
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "message",
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})
export const ConversationModel = model("conversation", conversationSchema)