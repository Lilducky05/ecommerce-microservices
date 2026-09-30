require('dotenv').config();

const express = require('express');
const pool = require('./config/db');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        service: 'customer-service',
        status: 'UP'
    });
});

app.get('/api/customers/:uid', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                uid,
                fullname,
                mid AS membership_id
             FROM "Customer"
             WHERE uid = $1`,
            [req.params.uid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Customer not found'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get customer error:', error);

        res.status(500).json({
            message: 'Cannot get customer'
        });
    }
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
    console.log(`Customer REST Service running on port ${PORT}`);
});

require('./grpc/customerServer');