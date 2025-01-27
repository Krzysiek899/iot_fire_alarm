const express = require('express');
const db = require('../config/db');

const router = express.Router();

require('dotenv').config();

/**
 * Rejestracja urządzenia za pomocą tokena powiązania
 */
router.post('/register-device', (req, res) => {
    const { token, device_name, serial_number, mac_address } = req.body;

    if (!token || !device_name || !serial_number || !mac_address) {
        return res.status(400).json({ message: 'Brak wymaganych danych' });
    }

    // Sprawdzenie czy token istnieje i nie został użyty
    const tokenQuery = `
        SELECT user_id FROM user_tokens 
        WHERE token = ? AND used = FALSE AND expires_at > NOW()
    `;

    db.query(tokenQuery, [token], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }
        if (results.length === 0) {
            return res.status(400).json({ message: 'Nieprawidłowy lub wygasły token' });
        }

        const userId = results[0].user_id;

        // Sprawdzenie czy urządzenie już istnieje
        const checkDeviceQuery = `
            SELECT id FROM devices WHERE serial_number = ? OR mac_address = ?
        `;

        db.query(checkDeviceQuery, [serial_number, mac_address], (err, deviceResults) => {
            if (err) {
                return res.status(500).json({ message: 'Błąd sprawdzania urządzenia', error: err });
            }
            if (deviceResults.length > 0) {
                return res.status(400).json({ message: 'Urządzenie z tym numerem seryjnym lub MAC już istnieje' });
            }

            // Generowanie tematu MQTT
            const mqttTopic = `${userId}/${mac_address.replace(/:/g, '')}/`;

            // Dodanie urządzenia do bazy danych
            const insertDeviceQuery = `
                INSERT INTO devices (user_id, device_name, serial_number, mac_address, mqtt_topic, status)
                VALUES (?, ?, ?, ?, ?, 'active')
            `;

            db.query(insertDeviceQuery, [userId, device_name, serial_number, mac_address, mqttTopic], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Błąd podczas dodawania urządzenia', error: err });
                }

                const deviceId = result.insertId;

                // Ustawienie domyślnych progów dla urządzenia
                const insertThresholdsQuery = `
                    INSERT INTO thresholds (device_id, temperature_threshold, smoke_threshold)
                    VALUES (?, ?, ?)
                `;

                const defaultThresholds = [deviceId, 25.0, 0.5];

                db.query(insertThresholdsQuery, defaultThresholds, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Błąd ustawiania domyślnych progów', error: err });
                    }

                    // Oznaczenie tokena jako użytego
                    const updateTokenQuery = `
                        UPDATE user_tokens SET used = TRUE WHERE token = ?
                    `;

                    db.query(updateTokenQuery, [token], (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Błąd aktualizacji tokena', error: err });
                        }

                        res.json({ mqtt_topic: mqttTopic, mqttBroker: process.env.MQTT_BROKER_URL});
                        //res.send(mqttTopic);
                    });
                });
            });
        });
    });
});

module.exports = router;
