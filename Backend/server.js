import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

// Connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/Database1', {
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.post('/echo', (req, res) => {
    res.json({ youSent: req.body });
});

// Routes
import usersRoutes from './routes/usersRoutes.js';
app.use('/users', usersRoutes);

import { getWeatherData } from './weatherService.js';
app.post('/api/weather', async (req, res) => {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
        return res.status(400).json({ 
            success: false,
            error: 'Latitude and longitude required' 
        });
    }
    
    const result = await getWeatherData(latitude, longitude);
    res.json(result);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});