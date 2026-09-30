const { createClient } = require('redis');

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (error) => {
    console.error('Redis error:', error);
});

async function connectRedis() {
    await client.connect();
    console.log('Gateway Redis connected');
}

module.exports = {
    client,
    connectRedis
};