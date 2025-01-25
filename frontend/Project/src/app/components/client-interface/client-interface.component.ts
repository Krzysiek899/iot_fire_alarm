import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-client-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-interface.component.html',
  styleUrls: ['./client-interface.component.css'],
})


export class ClientInterfaceComponent implements OnInit {
  currentDate: Date;
  //Zmiany czujnika
  temperatureThreshold: number = 30;
  mg2Threshold: number = 50;
  message: string = '';

  // Konstruktor komponentu
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentDate = new Date();
  }

  // Inicjalizacja komponentu
  ngOnInit(): void {
    
  } 

  saveSettings() {
    // Symulacja zapisu do bazy danych
    console.log('Zapisane ustawienia:', {
      temperatureThreshold: this.temperatureThreshold,
      mg2Threshold: this.mg2Threshold
    });
    this.message = 'Ustawienia zostały zapisane pomyślnie!';
  }
 
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);  // Przekierowanie do strony logowania
  }

  devices = [
    { id: 1, name: 'Czujnik w salonie' },
    { id: 2, name: 'Czujnik w kuchni' },
    { id: 3, name: 'Czujnik w sypialni' }
  ];

  removeDevice(deviceId: number): void {
    this.devices = this.devices.filter(device => device.id !== deviceId);
  }

  navigateToDeviceControl(deviceId: number): void {
    this.router.navigate(['/device-interface', deviceId]);
  }

  addDevice(): void {
    const newId = this.devices.length > 0 ? Math.max(...this.devices.map(d => d.id)) + 1 : 1;
    const newDevice = { id: newId, name: `Nowe urządzenie ${newId}` };
    this.devices.push(newDevice);
  }

 

}
