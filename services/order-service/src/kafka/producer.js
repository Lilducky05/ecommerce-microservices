const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

async function connectProducer() {
    await producer.connect();
    console.log('Order Kafka Producer connected');
}

async function publishOrderCreated(order) {
    await producer.send({
        topic: process.env.KAFKA_TOPIC || 'order-created',
        messages: [
            {
                key: order.oid,
                value: JSON.stringify(order)
            }
        ]
    });

    console.log('Order event published:', order.oid);
}

module.exports = {
    connectProducer,
    publishOrderCreated
};