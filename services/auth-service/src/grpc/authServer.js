const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');

const PROTO_PATH = require('path').join(
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

function validateToken(call, callback) {
    try {
        const token = call.request.token;

        if (!token) {
            return callback(null, {
                valid: false,
                uid: '',
                username: '',
                role: ''
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'ecommerce_microservices_secret'
        );

        callback(null, {
            valid: true,
            uid: decoded.uid || '',
            username: decoded.username || '',
            role: decoded.role || ''
        });
    } catch (error) {
        callback(null, {
            valid: false,
            uid: '',
            username: '',
            role: ''
        });
    }
}

function startGrpcServer() {
    const server = new grpc.Server();

    server.addService(authProto.AuthService.service, {
        ValidateToken: validateToken
    });

    server.bindAsync(
        '0.0.0.0:50051',
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error(error);
                return;
            }

            console.log(`Auth gRPC Server running on port ${port}`);
        }
    );
}

startGrpcServer();