require('dotenv').config();

const express = require('express');
const { testConnection } = require('./config/db');
const { connectProducer } = require('./kafka/producer');
const { publishOrderCreated } = require('./kafka/producer');
const { query } = require('./config/db');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        service: 'order-service',
        status: 'UP'
    });
});

app.post('/api/orders', async (req, res) => {
    try {
        const { uid, discount = 0, items } = req.body;

        if (!uid || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'uid and items are required'
            });
        }

        const oid = `ORD${Date.now()}`;

        await query(
            `INSERT INTO "Order" (oid, uid, discount)
             VALUES ($1, $2, $3)`,
            [oid, uid, discount]
        );

        let subtotal = 0;

        for (const item of items) {
            await query(
                `INSERT INTO "OrderDetail"
                 (oid, pid, qty, unit_price)
                 VALUES ($1, $2, $3, $4)`,
                [oid, item.pid, item.qty, item.unit_price]
            );

            subtotal += item.qty * item.unit_price;
        }

        const total = subtotal * (1 - discount / 100);

        await publishOrderCreated({
            oid,
            uid,
            items,
            discount,
            total
        });

        res.status(201).json({
            success: true,
            oid,
            discount,
            total
        });
    } catch (error) {
        console.error('Create order error:', error);

        res.status(500).json({
            message: 'Cannot create order'
        });
    }
});

const PORT = process.env.PORT || 5004;

async function start() {
    try {
        await testConnection();
        await connectProducer();

        app.listen(PORT, () => {
            console.log(`Order REST Service running on port ${PORT}`);
        });

        require('./grpc/orderServer');
    } catch (error) {
        console.error('Order Service startup failed:', error);
        process.exit(1);
    }
}

start();