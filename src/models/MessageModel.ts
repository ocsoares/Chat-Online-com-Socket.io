import mongoose, { Schema } from "mongoose";

export const MessageModel = mongoose.model('message', new Schema({
    message: { type: String, required: true },
    username: { type: String, required: true },
    room: { type: String, required: true }
},
    {
        timestamps: true
    }
));