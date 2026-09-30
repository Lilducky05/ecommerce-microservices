const { Kafka } = require('kafkajs');
const { getDB } = require('../config/db');

const kafka = new Kafka({
    clientId: 'shipment-service',
    brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({
    groupId: 'shipment-service-group'
});

async function startConsumer() {
    await consumer.connect();

    await consumer.subscribe({
        topic: process.env.KAFKA_TOPIC,
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const data = JSON.parse(message.value.toString());

                console.log('Received order-created:', data);

                const db = getDB();

                const shipment = {
                    shipid: `SHIP${Date.now()}`,
                    oid: data.oid,
                    status: 'PENDING'
                };

                await db.collection('shipments').insertOne(shipment);

                console.log('Shipment created:', shipment);
            } catch (error) {
                console.error('Kafka consumer error:', error);
            }
        }
    });
}

module.exports = {
    startConsumer
};