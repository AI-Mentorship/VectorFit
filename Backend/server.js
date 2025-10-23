require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const mongoose = require('mongoose');

// Connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/Database1', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.post('/echo', (req, res) => {
    res.json({ youSent: req.body });
});


// Routes
const routes = require('./routes/stats');
app.use('/', routes);

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Central error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`API running at http://localhost:${PORT}`);
});