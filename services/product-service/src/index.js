require('dotenv').config();

const express = require('express');
const { connectDB, getDB } = require('./config/db');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        service: 'product-service',
        status: 'UP'
    });
});

app.get('/api/products', async (req, res) => {
    try {
        const db = getDB();

        const products = await db
            .collection('products')
            .find({})
            .toArray();

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);

        res.status(500).json({
            message: 'Cannot get products'
        });
    }
});

const PORT = process.env.PORT || 5003;

async function start() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Product REST Service running on port ${PORT}`);
        });

        require('./grpc/productServer');
    } catch (error) {
        console.error('Product Service startup failed:', error);
        process.exit(1);
    }
}

start();