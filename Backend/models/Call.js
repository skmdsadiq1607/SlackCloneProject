import { Schema, model } from 'mongoose'
const callSchema = new Schema({
    callType: {
        type: String,
        enum: ["audio", "video"],
        required: [true, "Call type is required"]
    },
    callMode: {
        type: String,
        enum: ["dm", "channel"],
        required: [true, "Call mode is required"]
    },
    initiatedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Initiator is required"]
    },
    // for DM calls
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "conversation",
        default: null
    },
    // for channel calls
    channelId: {
        type: Schema.Types.ObjectId,
        ref: "channel",
        default: null
    },
    participants: [{
        user: { type: Schema.Types.ObjectId, ref: "user" },
        joinedAt: { type: Date, default: null },
        leftAt: { type: Date, default: null },
        status: {
            type: String,
            enum: ["invited", "joined", "declined", "missed"],
            default: "invited"
        }
    }],
    status: {
        type: String,
        enum: ["ringing", "ongoing", "ended", "missed"],
        default: "ringing"
    },
    startedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in seconds
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})
export const CallModel = model("call", callSchema)