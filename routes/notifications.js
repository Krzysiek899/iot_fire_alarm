const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware');


const router = express.Router();

/**
 * Pobranie listy powiadomień przypisanych do zalogowanego użytkownika
 */
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT n.id, n.device_id, d.device_name, n.message, n.status, n.created_at
        FROM notifications n
        INNER JOIN devices d ON n.device_id = d.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }
        res.json(results);
    });
});

/**
 * Oznaczanie powiadomień jako przeczytane
 */
router.put('/:notificationId/read', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const notificationId = req.params.notificationId;

    const query = `
        UPDATE notifications 
        SET status = 'read' 
        WHERE id = ? AND user_id = ?
    `;

    db.query(query, [notificationId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Błąd serwera', error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Powiadomienie nie istnieje lub nie masz dostępu' });
        }
        res.json({ message: 'Powiadomienie oznaczone jako przeczytane' });
    });
});

module.exports = router;
