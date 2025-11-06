import Preferences from '../models/PreferencesSchema.js';

const getPreferences = async (req, res) => {
    try {
        const preferences = await Preferences.find();
        res.json(preferences);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const createPreferences = async (req, res) => {
    try {
        const { colorPreference, clothingStyle, brandPreference, materialPreference } = req.body;
        const newPreferences = new Preferences({ colorPreference, clothingStyle, brandPreference, materialPreference });
        const saved = await newPreferences.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Preferences.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Preferences not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deletePreferences = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Preferences.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Preferences not found' });
        res.json({ message: 'Preferences deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export { getPreferences, createPreferences, updatePreferences, deletePreferences };