const express = require('express');
const db = require('../config/db');

const router = express.Router();


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

        // Generowanie tematu MQTT w formacie 'userID/macAddress/'
        const mqttTopic = `${userId}/${mac_address}/`;

        // Dodanie urządzenia do bazy danych
        const insertDeviceQuery = `
            INSERT INTO devices (user_id, device_name, serial_number, mac_address, mqtt_topic, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `;

        db.query(insertDeviceQuery, [userId, device_name, serial_number, mac_address, mqttTopic], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Błąd podczas dodawania urządzenia', error: err });
            }

            // Oznaczenie tokena jako użytego
            const updateTokenQuery = `
                UPDATE user_tokens SET used = TRUE WHERE token = ?
            `;

            db.query(updateTokenQuery, [token], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Błąd aktualizacji tokena', error: err });
                }

                res.json({ message: 'Urządzenie zarejestrowane pomyślnie', mqtt_topic: mqttTopic });
            });
        });
    });
});


module.exports = router;
