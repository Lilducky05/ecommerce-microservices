const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const protoPath = path.join(
    __dirname,
    '../../../../proto/customer/customer.proto'
);

const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).customer;

const client = new proto.CustomerService(
    'localhost:50052',
    grpc.credentials.createInsecure()
);

client.GetMembershipDiscount({ membership_id: 'MEM_BRONZE' },
    (error, response) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(response);
    }
);