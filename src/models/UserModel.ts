import mongoose, { Schema } from "mongoose";

//  Por enquanto vai ser só isso, Melhorar se necessário...
export const UserModel = mongoose.model('user', new Schema({
    username: { type: String, required: true },
    room: { type: String, required: true }
},
    {
        timestamps: true
    }
));