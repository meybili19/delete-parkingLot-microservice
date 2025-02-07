const express = require('express');
const app = express();
const parkingLotRoutes = require('./routes/parkingLotRoutes');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

app.use(bodyParser.json());

app.use('/parkinglot', parkingLotRoutes);

const PORT = process.env.PORT || 6003;
app.listen(PORT, () => {
  console.log(`Parking lot delete microservice running on port ${PORT}`);
});