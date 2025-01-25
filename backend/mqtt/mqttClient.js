const mqtt = require('mqtt');
const db = require('../config/db');
require('dotenv').config();

// Konfiguracja MQTT
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com';
const MQTT_OPTIONS = {
    clientId: `backend_${Math.random().toString(16).substr(2, 8)}`,
    clean: true
};

// Połączenie z brokerem MQTT
const client = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

client.on('connect', () => {
    console.log('Połączono z brokerem MQTT');

    // Subskrypcja tematów dla odbioru danych
    client.subscribe('+/+/sensors/#', (err) => {
        if (!err) {
            console.log('Subskrypcja wszystkich tematów MQTT');
        } else {
            console.error('Błąd subskrypcji:', err);
        }
    });
});

// Obsługa wiadomości przychodzących (od urządzeń)
client.on('message', (topic, message) => {
    console.log(`MQTT - otrzymano: ${topic}: ${message.toString()}`);

    const parts = topic.split('/');
    if (parts.length >= 4) {
        const userId = parts[0];
        const macAddress = parts[1];
        const category = parts[2];
        const subCategory = parts[3];

        // Obsługa odczytów z czujników
        if (category === 'sensors') {
            updateSensorData(macAddress, subCategory, message.toString());
        }

        // Obsługa alarmów
        if (category === 'alarms') {
            handleAlarm(macAddress, message.toString());
        }
    }
});

// Funkcja wysyłania danych do urządzenia przez MQTT
function sendCommandToDevice(userId, mac, category, subCategory, value) {
    const topic = `${userId}/${mac}/${category}/${subCategory}`;
    client.publish(topic, value, { qos: 1, retain: false }, (err) => {
        if (err) {
            console.error('Błąd wysyłania do MQTT:', err);
        } else {
            console.log(`MQTT - wysłano: ${topic}: ${value}`);
        }
    });
}

function updateSensorData(mac, type, value) {
    const columnMap = {
        'temperature': 'temperature',
        'pressure': 'pressure',
        'smoke': 'smoke_level'
    };

    const columnName = columnMap[type];
    if (!columnName) {
        console.error('Nieznany typ sensora:', type);
        return;
    }

    const query = `INSERT INTO sensor_readings (device_id, ${columnName}, received_at)
                   SELECT id, ?, NOW() FROM devices WHERE mac_address = ?`;

    db.query(query, [parseFloat(value), mac], (err, result) => {
        if (err) {
            console.error(`Błąd aktualizacji danych sensora ${type}:`, err);
        } else {
            console.log(`Dane sensora ${type} zapisane dla urządzenia ${mac}`);
        }
    });
}

// Funkcja obsługi alarmów
function handleAlarm(mac, message) {
    const query = `INSERT INTO notifications (user_id, device_id, message, status, created_at)
                   SELECT user_id, id, ?, 'unread', NOW() FROM devices WHERE mac_address = ?`;

    db.query(query, [message, mac], (err, result) => {
        if (err) {
            console.error('Błąd dodawania alarmu:', err);
        } else {
            console.log(`Alarm zapisany dla urządzenia ${mac}: ${message}`);
        }
    });
}

// Obsługa błędów połączenia MQTT
client.on('error', (err) => {
    console.error('Błąd połączenia z MQTT:', err);
});


// Eksportowanie funkcji publikowania
module.exports = {
    client,
    sendCommandToDevice
};
