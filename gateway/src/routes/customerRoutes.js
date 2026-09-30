const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/:uid', async (req, res) => {
    try {
        const response = await axios.get(
            `${process.env.CUSTOMER_SERVICE_URL}/api/customers/${req.params.uid}`
        );

        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            return res
                .status(error.response.status)
                .json(error.response.data);
        }

        res.status(500).json({
            message: 'Customer Service unavailable'
        });
    }
});

module.exports = router;