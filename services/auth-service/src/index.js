require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({
        service: 'auth-service',
        status: 'UP'
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Auth REST Service running on port ${PORT}`);
});

require('./grpc/authServer');