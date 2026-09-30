const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

const client = new proto.OrderService(
    'localhost:50054',
    grpc.credentials.createInsecure()
);

client.CreateOrder(
    {
        uid: 'U1790589168679',
        discount: 0,
        items: [
            {
                pid: 'P001',
                qty: 1,
                unit_price: 1500
            }
        ]
    },
    (error, response) => {
        if (error) {
            console.error('CreateOrder error:', error);
            return;
        }

        console.log('CreateOrder response:', response);
    }
);