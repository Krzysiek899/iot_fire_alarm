const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');
const { sendCommandToDevice } = require('../mqtt/mqttClient');

const router = express.Router();

/**
 * Pobranie listy urządzeń przypisanych do zalogowanego użytkownika
 */
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT id, device_name, serial_number, mac_address, status, last_seen 
        FROM devices 
        WHERE user_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }
        res.json(results);
    });
});

/**
 * Pobranie danych konkretnego urządzenia przypisanego do zalogowanego użytkownika
 */
router.get('/:deviceId', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.deviceId;

    const query = `
        SELECT d.id, d.device_name, d.serial_number, d.mac_address, d.status, d.last_seen, 
               t.temperature_threshold, t.smoke_threshold, t.co2_threshold,
               s.temperature, s.smoke_level, s.co2_level, s.received_at
        FROM devices d
        LEFT JOIN thresholds t ON d.id = t.device_id
        LEFT JOIN sensor_readings s ON d.id = s.device_id
        WHERE d.id = ? AND d.user_id = ?
        ORDER BY s.received_at DESC
        LIMIT 1`;

    db.query(query, [deviceId, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Nie znaleziono urządzenia lub brak uprawnień' });
        }
        res.json(results[0]);
    });
});

/**
 * Pobranie historii pomiarów urządzenia w podanym przedziale czasowym
 */
router.get('/:deviceId/history', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.deviceId;
    const { startDate, endDate } = req.query;

    // Walidacja danych wejściowych
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Podaj zakres dat: startDate i endDate' });
    }

    const query = `
        SELECT s.temperature, s.smoke_level, s.co2_level, s.received_at
        FROM sensor_readings s
        INNER JOIN devices d ON s.device_id = d.id
        WHERE d.id = ? AND d.user_id = ? 
        AND s.received_at BETWEEN ? AND ?
        ORDER BY s.received_at ASC
    `;

    db.query(query, [deviceId, userId, startDate, endDate], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Brak danych dla podanego zakresu dat' });
        }
        res.json(results);
    });
});


router.post('/:deviceId/reset', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.deviceId;

    const query = `SELECT mac_address FROM devices WHERE id = ? AND user_id = ?`;
    db.query(query, [deviceId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Błąd serwera', error: err });
        if (result.length === 0) {
            return res.status(403).json({ message: 'Nie masz dostępu do tego urządzenia' });
        }

        const macAddress = result[0].mac_address;

        // Wysyłanie resetu do urządzenia przez MQTT
        sendCommandToDevice(userId, macAddress, 'reset', '', '1');

        res.status(200).json({ message: 'Urządzenie zostało zresetowane' });
    });
});

router.post('/:deviceId/threshold/:type', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.deviceId;
    const thresholdValue = req.body.value;
    const type = req.params.type;  // Oczekiwane wartości: temperature, pressure, smoke

    if (!thresholdValue) {
        return res.status(400).json({ message: 'Podaj wartość progu' });
    }

    // Mapowanie typów progów na kolumny bazy danych
    const thresholdMap = {
        'temperature': 'temperature_threshold',
        'pressure': 'pressure_threshold',
        'smoke': 'smoke_threshold'
    };

    const thresholdColumn = thresholdMap[type];

    if (!thresholdColumn) {
        return res.status(400).json({ message: 'Nieprawidłowy typ progu' });
    }

    // Sprawdzenie, czy urządzenie należy do użytkownika
    const query = `SELECT mac_address FROM devices WHERE id = ? AND user_id = ?`;
    db.query(query, [deviceId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Błąd serwera', error: err });
        if (result.length === 0) {
            return res.status(403).json({ message: 'Nie masz dostępu do tego urządzenia' });
        }

        const macAddress = result[0].mac_address;

        // Aktualizacja progu w bazie danych
        const updateQuery = `UPDATE thresholds SET ${thresholdColumn} = ? WHERE device_id = ?`;

        db.query(updateQuery, [parseFloat(thresholdValue), deviceId], (err) => {
            if (err) return res.status(500).json({ message: 'Błąd aktualizacji progu', error: err });

            // Wysyłanie nowej wartości progu do urządzenia przez MQTT
            sendCommandToDevice(userId, macAddress, 'threshold', type, thresholdValue.toString());

            res.status(200).json({ message: `Próg ${type} ustawiony na ${thresholdValue}` });
        });
    });
});



module.exports = router;
