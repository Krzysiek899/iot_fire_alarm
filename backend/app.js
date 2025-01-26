const express = require('express');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const devicesRoutes = require('./routes/devices');
const notificationRoutes = require('./routes/notifications');
const tokensRoutes = require('./routes/tokens');
const pairingRoutes = require('./routes/pairing');
const morgan = require('morgan');
const mqttClient = require('./mqtt/mqttClient');
const cors = require('cors')

require('dotenv').config();

const app = express();

app.use(morgan('dev'));

// Middleware
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:4200',  // Adres frontendu
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
}));

// Trasy
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/pairing', pairingRoutes);

// mqttClient.client.publish('1234/device/status', 'Serwer uruchomiony', (err) => {
//     if (err) {
//         console.error('Błąd MQTT:', err);
//     } else {
//         console.log('Wysłano powitalną wiadomość MQTT');
//     }
// });

module.exports = app;
