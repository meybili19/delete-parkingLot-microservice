const db = require('../config/db');
const request = require('request');
require('dotenv').config();

exports.deleteParkingLot = async (req, res) => {
    const parkingLotId = req.params.id;

    console.log(`🔄 [STEP 1] Received request to delete parking lot with ID: ${parkingLotId}`);

    if (!parkingLotId) {
        console.log(`⚠️ [ERROR] No valid ID provided`);
        return res.status(400).json({ message: "Parking Lot ID is required" });
    }

    try {
        // 🔎 Querying the parking lot microservice
        const parkingLotServiceURL = `${process.env.PARKING_SERVICE_URL}${parkingLotId}`;
        console.log(`🔎 [STEP 2] Querying the parking lot at: ${parkingLotServiceURL}`);

        request(parkingLotServiceURL, { json: true }, async (err, response, body) => {
            if (err) {
                console.error(`🚨 [ERROR] Failed to query the parking lot:`, err);
                return res.status(500).json({ message: 'Error fetching parking lot data', error: err.message });
            }

            if (!body || !body.id) {
                console.log(`❌ [STEP 3] Parking lot with ID ${parkingLotId} not found`);
                return res.status(404).json({ message: "Parking lot not found" });
            }

            let { total_space, capacity } = body;
            let occupied_spaces = total_space - capacity; // Currently parked cars

            console.log(`📊 [STEP 4] Parking lot data - total_space: ${total_space}, capacity: ${capacity}, occupied_spaces: ${occupied_spaces}`);

            // ❌ If there are parked cars, it CANNOT be deleted
            if (occupied_spaces > 0) {
                console.log(`🚨 [ERROR] Cannot delete parking lot because there are ${occupied_spaces} cars parked.`);
                return res.status(400).json({
                    message: `Cannot delete parking lot, as ${occupied_spaces} spaces are currently occupied.`
                });
            }

            console.log(`🗑️ [STEP 5] Deleting parking lot with ID: ${parkingLotId}`);

            try {
                const [result] = await db.execute(
                    'DELETE FROM ParkingLot WHERE id = ?',
                    [parkingLotId]
                );

                if (result.affectedRows === 0) {
                    console.log(`❌ [STEP 6] Parking lot not found in the database`);
                    return res.status(404).json({ message: 'Parking lot not found in database' });
                }

                console.log(`✅ [STEP 7] Parking lot deleted successfully`);

                res.status(200).json({ message: 'Parking lot deleted successfully' });
            } catch (dbError) {
                console.error(`🚨 [ERROR] Failed to delete from the database:`, dbError);
                res.status(500).json({ message: 'Error deleting parking lot', error: dbError.message });
            }
        });
    } catch (error) {
        console.error(`🚨 [ERROR] Unexpected error during deletion:`, error);
        res.status(500).json({ message: 'Error deleting parking lot', error: error.message });
    }
};
