const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { getDB } = require('../config/db');

const protoPath = path.join(
    __dirname,
    '../../../../proto/product/product.proto'
);

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).product;

async function getProduct(call, callback) {
    try {
        const db = getDB();
        const product = await db.collection('products').findOne({
            pid: call.request.pid
        });

        if (!product) {
            return callback(null, {
                found: false,
                pid: '',
                pname: '',
                price: 0,
                quantity: 0
            });
        }

        callback(null, {
            found: true,
            pid: product.pid,
            pname: product.pname,
            price: product.price,
            quantity: product.quantity
        });
    } catch (error) {
        callback(error);
    }
}

async function checkInventory(call, callback) {
    try {
        const db = getDB();
        const product = await db.collection('products').findOne({
            pid: call.request.pid
        });

        if (!product) {
            return callback(null, {
                available: false,
                current_quantity: 0
            });
        }

        callback(null, {
            available: product.quantity >= call.request.quantity,
            current_quantity: product.quantity
        });
    } catch (error) {
        callback(error);
    }
}

async function updateInventory(call, callback) {
    try {
        const db = getDB();

        const result = await db.collection('products').findOneAndUpdate(
            {
                pid: call.request.pid,
                quantity: { $gte: call.request.quantity }
            },
            {
                $inc: { quantity: -call.request.quantity }
            },
            {
                returnDocument: 'after'
            }
        );

        if (!result) {
            return callback(null, {
                success: false,
                remaining_quantity: 0
            });
        }

        callback(null, {
            success: true,
            remaining_quantity: result.quantity
        });
    } catch (error) {
        callback(error);
    }
}

const server = new grpc.Server();

server.addService(proto.ProductService.service, {
    GetProduct: getProduct,
    CheckInventory: checkInventory,
    UpdateInventory: updateInventory
});

server.bindAsync(
    '0.0.0.0:50053',
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(`Product gRPC Server running on port ${port}`);
        server.start();
    }
);