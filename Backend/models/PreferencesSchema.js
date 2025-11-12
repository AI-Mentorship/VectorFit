import { Schema, model } from 'mongoose';

const preferencesSchema = new Schema({
    colorPreference: String,
    clothingStyle: String,
    brandPreference: String,
    materialPreference: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default model('Preferences', preferencesSchema);