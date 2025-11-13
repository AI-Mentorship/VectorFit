import { Schema, model } from 'mongoose';

const itemSchema = new Schema({
    picturePath: String,
    name: String,
    color: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default model('Item', itemSchema);