const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/:shipid', async(req, res) => {
    try {
        const response = await axios.get(
            `${process.env.SHIPMENT_SERVICE_URL}/api/shipments/${req.params.shipid}`
        );

        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            return res
                .status(error.response.status)
                .json(error.response.data);
        }

        res.status(500).json({
            message: 'Shipment Service unavailable'
        });
    }
});

module.exports = router;