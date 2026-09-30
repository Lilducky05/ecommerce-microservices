const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const pool = require('../config/db');

const PROTO_PATH = path.join(
    __dirname,
    '../../../../proto/customer/customer.proto'
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const customerProto =
    grpc.loadPackageDefinition(packageDefinition).customer;

function getCustomer(call, callback) {
    const { uid } = call.request;

    pool.query(
            `SELECT c.uid, c.fullname, c.mid
         FROM "Customer" c
         WHERE c.uid = $1`, [uid]
        )
        .then(result => {
            if (result.rows.length === 0) {
                return callback(null, {
                    found: false,
                    uid: '',
                    fullname: '',
                    membership_id: ''
                });
            }

            const customer = result.rows[0];

            callback(null, {
                found: true,
                uid: customer.uid,
                fullname: customer.fullname,
                membership_id: customer.mid || ''
            });
        })
        .catch(error => {
            console.error(error);

            callback(null, {
                found: false,
                uid: '',
                fullname: '',
                membership_id: ''
            });
        });
}

function getMembershipDiscount(call, callback) {
    const { membership_id } = call.request;

    pool.query(
            `SELECT mid, mname, score
         FROM "MemberShip"
         WHERE mid = $1`, [membership_id]
        )
        .then(result => {
            if (result.rows.length === 0) {
                return callback(null, {
                    discount: 0
                });
            }

            const membership = result.rows[0];

            let discount = 0;

            if (membership.mname === 'SILVER') {
                discount = 5;
            } else if (membership.mname === 'GOLD') {
                discount = 10;
            }

            callback(null, {
                discount
            });
        })
        .catch(error => {
            console.error(error);

            callback(null, {
                discount: 0
            });
        });
}

function startGrpcServer() {
    const server = new grpc.Server();

    server.addService(customerProto.CustomerService.service, {
        GetCustomer: getCustomer,
        GetMembershipDiscount: getMembershipDiscount
    });

    server.bindAsync(
        '0.0.0.0:50052',
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error(error);
                return;
            }

            console.log(
                `Customer gRPC Server running on port ${port}`
            );
        }
    );
}

startGrpcServer();