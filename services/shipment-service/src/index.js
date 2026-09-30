require('dotenv').config();

const express = require('express');
const { connectDB, getDB } = require('./config/db');
const { startConsumer } = require('./kafka/consumer');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        service: 'shipment-service',
        status: 'UP'
    });
});

app.get('/api/shipments/:shipid', async(req, res) => {
    try {
        const db = getDB();

        const shipment = await db.collection('shipments').findOne({
            shipid: req.params.shipid
        });

        if (!shipment) {
            return res.status(404).json({
                message: 'Shipment not found'
            });
        }

        res.json({
            shipid: shipment.shipid,
            oid: shipment.oid,
            status: shipment.status
        });
    } catch (error) {
        console.error('Get shipment error:', error);

        res.status(500).json({
            message: 'Cannot get shipment'
        });
    }
});

const PORT = process.env.PORT || 5005;

async function start() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Shipment REST Service running on port ${PORT}`);
        });

        require('./grpc/shipmentServer');

        await startConsumer();

        console.log('Shipment Kafka Consumer running');
    } catch (error) {
        console.error('Shipment Service startup failed:', error);
        process.exit(1);
    }
}

start();