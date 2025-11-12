import Item from '../models/ItemSchema.js';

const getItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const createItem = async (req, res) => {
    try {
        const { picturePath, name, color } = req.body;
        const newItem = new Item({ picturePath, name, color });
        const saved = await newItem.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Item.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Item not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Item.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export { getItems, createItem, updateItem, deleteItem };