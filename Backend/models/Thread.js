import { Schema, model } from 'mongoose'
const threadSchema = new Schema({
    parentMessageId: {
        type: Schema.Types.ObjectId,
        ref: "message",
        required: [true, "Parent message is required"]
    },
    channelId: {
        type: Schema.Types.ObjectId,
        ref: "channel",
        required: [true, "Channel is required"]
    },
    replies: [{
        type: Schema.Types.ObjectId,
        ref: "message"
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Creator is required"]
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})
export const ThreadModel = model("thread", threadSchema)