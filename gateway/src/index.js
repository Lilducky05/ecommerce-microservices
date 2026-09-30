require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { connectRedis } = require('./redis');
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./middleware/auth');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.get('/health', (req, res) => {
    res.json({
        service: 'api-gateway',
        status: 'UP'
    });
});

app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Access granted',
        user: req.user
    });
});

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`API Gateway running on port ${PORT}`);
        });
    } catch (error) {
        console.error('API Gateway startup failed:', error);
        process.exit(1);
    }
}

start();