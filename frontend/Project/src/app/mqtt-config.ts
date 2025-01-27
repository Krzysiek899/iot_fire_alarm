import { IMqttServiceOptions } from 'ngx-mqtt';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
    hostname: '127.0.0.1', // Upewnij się, że masz poprawny adres brokera
    port: 9100,                     // Standardowy port WebSocket (zmień na 8883 dla wss)
    path: '/',                   // MQTT WebSocket path
    protocol: 'ws',                   // Użyj 'wss' dla bezpiecznego połączenia
    // username: '',                      // Usuń jeśli broker nie wymaga autoryzacji
    // password: '',                      // Usuń jeśli broker nie wymaga autoryzacji
    connectTimeout: 5000,               // Timeout połączenia
    reconnectPeriod: 5000                // Okres ponownego połączenia
};
