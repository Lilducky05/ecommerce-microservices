const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const path = require('path');

const PROTO_PATH = path.join(
    __dirname,
    '../../../../proto/auth/auth.proto'
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.AuthService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

const token = process.argv[2];

if (!token) {
    console.error('JWT token is required');
    process.exit(1);
}

client.ValidateToken({ token },
    (error, response) => {
        if (error) {
            console.error('gRPC Error:', error.message);
            return;
        }

        console.log('ValidateToken response:');
        console.log(response);
    }
);