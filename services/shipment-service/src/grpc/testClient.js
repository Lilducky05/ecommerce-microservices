const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

const client = new proto.ShipmentService(
    'localhost:50055',
    grpc.credentials.createInsecure()
);

client.GetShipment(
    {
        shipid: 'SHIP1790682032200'
    },
    (error, response) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(response);
    }
);