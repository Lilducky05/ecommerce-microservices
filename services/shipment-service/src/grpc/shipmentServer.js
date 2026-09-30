const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { getDB } = require('../config/db');

const protoPath = path.join(
    __dirname,
    '../../../../proto/shipment/shipment.proto'
);

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).shipment;

async function getShipment(call, callback) {
    try {
        const db = getDB();

        const filter = {};

        if (call.request.shipid) {
            filter.shipid = call.request.shipid;
        }

        if (call.request.oid) {
            filter.oid = call.request.oid;
        }

        if (call.request.status) {
            filter.status = call.request.status;
        }

        const shipment = await db.collection('shipments').findOne(filter);

        if (!shipment) {
            return callback(null, {
                found: false,
                shipid: '',
                oid: '',
                status: ''
            });
        }

        callback(null, {
            found: true,
            shipid: shipment.shipid,
            oid: shipment.oid,
            status: shipment.status
        });
    } catch (error) {
        callback(error);
    }
}

async function createShipment(call, callback) {
    try {
        const db = getDB();

        const shipment = {
            shipid: `SHIP${Date.now()}`,
            oid: call.request.oid,
            status: 'PENDING'
        };

        await db.collection('shipments').insertOne(shipment);

        callback(null, {
            success: true,
            shipid: shipment.shipid,
            status: shipment.status
        });
    } catch (error) {
        callback(error);
    }
}

const server = new grpc.Server();

server.addService(proto.ShipmentService.service, {
    GetShipment: getShipment,
    CreateShipment: createShipment
});

server.bindAsync(
    '0.0.0.0:50055',
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(`Shipment gRPC Server running on port ${port}`);
    }
);