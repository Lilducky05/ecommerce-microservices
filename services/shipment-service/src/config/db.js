const { MongoClient } = require('mongodb');

const client = new MongoClient(
    process.env.MONGO_URI || 'mongodb://localhost:27017'
);

let db;

async function connectDB() {
    await client.connect();
    db = client.db(process.env.MONGO_DB || 'ecommerce_shipment');
    console.log('Shipment MongoDB connected');
}

function getDB() {
    if (!db) {
        throw new Error('MongoDB is not connected');
    }

    return db;
}

module.exports = {
    connectDB,
    getDB
};