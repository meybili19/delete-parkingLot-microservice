const db = require('../config/db');
const request = require('request');
require('dotenv').config();

exports.deleteParkingLot = async (req, res) => {
    const parkingLotId = req.params.id;

    console.log("Received Parking Lot ID:", parkingLotId);

    if (!parkingLotId) {
        return res.status(400).json({ message: "Parking Lot ID is required" });
    }

    try {
        // Query the parking lot service to verify that the ID exists
        const parkingLotServiceURL = `${process.env.PARKING_SERVICE_URL}${parkingLotId}`;
        console.log("Querying parking lot:", parkingLotServiceURL);

        request(parkingLotServiceURL, { json: true }, async (err, response, body) => {
            if (err) {
                console.error("Error querying the parking lot:", err);
                return res.status(500).json({ message: 'Error fetching parking lot data', error: err.message });
            }

            console.log("Parking lot service response:", body);

            // If the parking lot was not found, return error
            if (!body || !body.id) {
                return res.status(404).json({ message: "Parking lot not found" });
            }

            console.log("Deleting parking lot with ID:", parkingLotId);

            try {
                const [result] = await db.execute(
                    'DELETE FROM ParkingLot WHERE id = ?',
                    [parkingLotId]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Parking lot not found in database' });
                }

                res.status(200).json({ message: 'Parking lot deleted successfully' });
            } catch (dbError) {
                console.error("Database error:", dbError);
                res.status(500).json({ message: 'Error deleting parking lot', error: dbError.message });
            }
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: 'Error deleting parking lot', error: error.message });
    }
};
