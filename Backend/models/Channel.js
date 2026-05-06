import { Schema, model } from 'mongoose'
const channelSchema = new Schema({
    name: {
        type: String,
        required: [true, "Channel name is required"],
        unique: [true, "Channel name already exists"],
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    createdBy: {
        type:Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Creator is required"]
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    isChannelActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false,
    strict: "throw"
})
export const ChannelModel = model("channel", channelSchema)