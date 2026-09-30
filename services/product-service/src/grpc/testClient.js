const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

const client = new proto.ProductService(
    'localhost:50053',
    grpc.credentials.createInsecure()
);

client.UpdateInventory(
    {
        pid: 'P001',
        quantity: 3
    },
    (error, response) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(response);
    }
);