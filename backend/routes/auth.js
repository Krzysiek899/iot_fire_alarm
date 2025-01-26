const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Rejestracja użytkownika
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
    }

    // Sprawdzenie czy email lub username już istnieje
    db.query('SELECT username, email FROM users WHERE username = ? OR email = ?', [username, email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Błąd serwera' });

        if (result.length > 0) {
            if (result[0].username === username) {
                return res.status(400).json({ message: 'Nazwa użytkownika już istnieje' });
            }
            if (result[0].email === email) {
                return res.status(400).json({ message: 'Email już istnieje' });
            }
        }

        try {
            // Generowanie unikalnego ID użytkownika
            const userId = uuidv4();

            // Hashowanie hasła
            const hashedPassword = await bcrypt.hash(password, 10);

            // Wstawianie użytkownika do bazy danych
            db.query(
                'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
                [userId, username, email, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Błąd rejestracji', error: err });

                    res.status(201).json({
                        message: 'Rejestracja udana',
                        userId
                    });
                }
            );
        } catch (error) {
            return res.status(500).json({ message: 'Błąd serwera', error });
        }
    });
});


// Logowanie użytkownika
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Błąd serwera' });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
        }

        // Generowanie tokena JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ message: 'Zalogowano pomyślnie', token });
    });
});

module.exports = router;
