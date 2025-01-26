import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device.service';
import { Device } from '../../models/device.model';

@Component({
  selector: 'app-client-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-interface.component.html',
  styleUrls: ['./client-interface.component.css'],
})

export class ClientInterfaceComponent implements OnInit {
  message: string = '';
  devices: Device[] = [];
  pairingToken: string | null = null;  // Przechowywanie tokena do wyświetlenia
  showToken: boolean = false;  // Kontrola widoczności tokena

  constructor(
      private authService: AuthService,
      private deviceService: DeviceService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  // Pobranie listy urządzeń z backendu
  loadDevices(): void {
    this.deviceService.getDevices().subscribe({
      next: (data) => {
        this.devices = data;
      },
      error: (error) => {
        this.message = 'Błąd pobierania urządzeń.';
        console.error(error);
      }
    });
  }

  // Generowanie tokena parowania i jego wyświetlenie
  generatePairingToken(): void {
    this.deviceService.generate_pairing_token().subscribe({
      next: (token) => {
        this.pairingToken = token;
        this.showToken = true;
      },
      error: (err) => {
        this.message = 'Błąd generowania tokena!';
        console.error(err);
      }
    });
  }

  // Ukrycie tokena po kliknięciu "Zamknij"
  closeTokenDisplay(): void {
    this.showToken = false;
    this.pairingToken = null;
  }

  // Wylogowanie użytkownika
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Nawigacja do interfejsu urządzenia
  navigateToDeviceControl(deviceId: string): void {
    this.router.navigate(['/devices', deviceId]);
  }

  // Zmiana nazwy urządzenia
  changeDeviceName(deviceId: string): void {
    const newName = prompt('Podaj nową nazwę urządzenia:');
    if (newName && newName.trim() !== '') {
      this.deviceService.updateDeviceName(deviceId, newName).subscribe({
        next: () => {
          this.message = `Nazwa urządzenia została zmieniona na "${newName}"`;
          this.loadDevices();
        },
        error: (err) => {
          this.message = 'Błąd podczas zmiany nazwy urządzenia!';
          console.error(err);
        }
      });
    } else {
      this.message = 'Nieprawidłowa nazwa urządzenia!';
    }
  }

  // Usunięcie urządzenia
  removeDevice(deviceId: string): void {
    if (confirm('Czy na pewno chcesz usunąć to urządzenie? Tej operacji nie można cofnąć.')) {
      this.deviceService.deleteDevice(deviceId).subscribe({
        next: () => {
          this.devices = this.devices.filter(device => device.id !== deviceId);
          this.message = 'Urządzenie usunięte pomyślnie!';
        },
        error: (err) => {
          this.message = 'Błąd usuwania urządzenia!';
          console.error(err);
        }
      });
    }
  }
}
