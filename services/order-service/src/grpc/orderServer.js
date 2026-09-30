const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { Pool } = require('pg');
const { publishOrderCreated } = require('../kafka/producer');

const protoPath = path.join(
    __dirname,
    '../../../../proto/order/order.proto'
);

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).order;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function createOrder(call, callback) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const oid = `ORD${Date.now()}`;

        await client.query(
            `INSERT INTO "Order" (oid, uid, discount)
             VALUES ($1, $2, $3)`, [
                oid,
                call.request.uid,
                call.request.discount
            ]
        );

        for (const item of call.request.items) {
            await client.query(
                `INSERT INTO "OrderDetail" (oid, pid, qty, unit_price)
                 VALUES ($1, $2, $3, $4)`, [
                    oid,
                    item.pid,
                    item.qty,
                    item.unit_price
                ]
            );
        }

        const subtotal = call.request.items.reduce(
            (sum, item) => sum + item.qty * item.unit_price,
            0
        );

        const total = subtotal * (1 - call.request.discount / 100);

        await client.query('COMMIT');

        await publishOrderCreated({
            oid,
            uid: call.request.uid,
            items: call.request.items,
            discount: call.request.discount,
            total
        });

        callback(null, {
            success: true,
            oid,
            discount: call.request.discount,
            total
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('CreateOrder error:', error);
        callback(error);
    } finally {
        client.release();
    }
}

const server = new grpc.Server();

server.addService(proto.OrderService.service, {
    CreateOrder: createOrder
});

server.bindAsync(
    '0.0.0.0:50054',
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(`Order gRPC Server running on port ${port}`);
    }
);