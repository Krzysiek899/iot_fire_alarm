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
        SELECT d.id, d.device_name, d.serial_number, d.mac_address, d.mqtt_topic, d.status, d.last_seen, 
               t.temperature_threshold, t.smoke_threshold
        FROM devices d
        LEFT JOIN thresholds t ON d.id = t.device_id
        WHERE d.id = ? AND d.user_id = ?`;

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

router.put('/:deviceId/name', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.deviceId;
    const { newName } = req.body;

    if (!newName || newName.trim() === '') {
        return res.status(400).json({ message: 'Nowa nazwa urządzenia jest wymagana' });
    }

    const query = `
        UPDATE devices 
        SET device_name = ? 
        WHERE id = ? AND user_id = ?`;

    db.query(query, [newName, deviceId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Nie znaleziono urządzenia lub brak uprawnień' });
        }

        res.status(200).json({ message: 'Nazwa urządzenia została zmieniona pomyślnie' });
    });
});




router.delete('/:deviceId', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const deviceId = req.params.deviceId;

    const query = `SELECT mac_address FROM devices WHERE id = ? AND user_id = ?`;
    db.query(query, [deviceId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }

        if (result.length === 0) {
            return res.status(403).json({ message: 'Nie masz dostępu do tego urządzenia' });
        }

        const macAddress = result[0].mac_address;

        // Wysyłanie resetu do urządzenia przez MQTT
        sendCommandToDevice(userId, macAddress.replace(/:/g, ""), 'config/reset', '', '1');

        // Usunięcie urządzenia z bazy danych
        const deleteQuery = `DELETE FROM devices WHERE id = ? AND user_id = ?`;

        db.query(deleteQuery, [deviceId, userId], (err, deleteResult) => {
            if (err) {
                return res.status(500).json({ message: 'Błąd podczas usuwania urządzenia', error: err });
            }

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Urządzenie nie zostało znalezione lub już zostało usunięte' });
            }

            res.status(200).json({ message: 'Urządzenie zostało zresetowane i usunięte' });
        });
    });
});


router.put('/:deviceId/threshold/:type', authenticateToken, (req, res) => {
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
            sendCommandToDevice(userId, macAddress.replace(/:/g, ""), 'config/threshold', type, thresholdValue.toString());

            res.status(200).json({ message: `Próg ${type} ustawiony na ${thresholdValue}` });
        });
    });
});





module.exports = router;
