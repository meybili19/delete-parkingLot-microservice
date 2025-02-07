const express = require('express');
const router = express.Router();
const parkingLotController = require('../controllers/parkingLotController');

router.delete('/delete/:id', parkingLotController.deleteParkingLot);

module.exports = router;
