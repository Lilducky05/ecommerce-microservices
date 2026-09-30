const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const response = await axios.post(
            `${process.env.ORDER_SERVICE_URL}/api/orders`,
            req.body
        );

        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            return res
                .status(error.response.status)
                .json(error.response.data);
        }

        res.status(500).json({
            message: 'Order Service unavailable'
        });
    }
});

module.exports = router;