const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User'); // Mongoose model

// ✅ Root route
router.get('/', (req, res) => {
    res.json({ message: 'Backend API is up 👋' });
});

// ✅ Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Add a new user (with validation)
router.post(
    '/users',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('age')
            .isInt({ min: 0 })
            .withMessage('Age must be a positive number'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, age } = req.body;
            const newUser = new User({ name, email, age });
            const savedUser = await newUser.save();
            res.status(201).json(savedUser);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

// ✅ Update a user by ID (with validation)
router.put(
    '/users/:id',
    [
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Must be a valid email'),
        body('age')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Age must be a positive number'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { name, email, age } = req.body;

            const updatedUser = await User.findByIdAndUpdate(
                id,
                { name, email, age },
                { new: true }
            );

            if (!updatedUser) return res.status(404).json({ error: 'User not found' });
            res.json(updatedUser);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

// ✅ Delete a user by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
