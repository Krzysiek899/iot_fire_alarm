export interface Device {
    id: string;                // UUID użytkownika
    device_name: string;       // Nazwa urządzenia
    serial_number: string;     // Numer seryjny urządzenia
    mac_address: string;// Adres MAC urządzenia
    mqtt_topic: string;
    status: 'active' | 'inactive';  // Status urządzenia
    last_seen: Date | null;    // Ostatni kontakt urządzenia (może być null)
    temperature_threshold: number;  // Próg temperatury
    smoke_threshold: number;        // Próg dymu
    co2_threshold: number;// Próg CO2
    created_at: Date;
}