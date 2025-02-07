const db = require('../config/db');
const request = require('request-promise');
const dotenv = require('dotenv');

dotenv.config();

exports.deleteParkingLot = async (req, res) => {
  const { id } = req.params;

  try {
    const parkingLotServiceURL = `${process.env.PARKING_SERVICE_URL}${id}`;

    const parkingLotResponse = await request({ uri: parkingLotServiceURL, json: true });

    if (!parkingLotResponse || !parkingLotResponse.id) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    await db.execute('DELETE FROM ParkingLot WHERE id = ?', [id]);

    res.status(200).json({ message: 'Parking lot deleted successfully' });
  } catch (error) {
    console.error('Error deleting parking lot:', error);
    res.status(500).json({ message: 'Error deleting parking lot' });
  }
};