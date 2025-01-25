const express = require('express');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const devicesRoutes = require('./routes/devices');
const notificationRoutes = require('./routes/notifications');
const tokensRoutes = require('./routes/tokens');
const pairingRoutes = require('./routes/pairing');

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Trasy
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/pairing', pairingRoutes);

module.exports = app;
