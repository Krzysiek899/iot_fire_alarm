import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-device-interface',
  imports: [CommonModule, FormsModule],
  templateUrl: './device-interface.component.html',
  styleUrl: './device-interface.component.css'
})
export class DeviceInterfaceComponent {
  currentDate: Date;
    //Zmiany czujnika
    temperatureThreshold: number = 30;
    mg2Threshold: number = 50;
    message: string = '';
    deviceId!: number;
    temperatureData: number[] = [22, 23, 24, 23, 25, 26, 27];  // Przykładowe dane
    mq2Data: number[] = [100, 200, 150, 180, 250, 220, 300];    // Przykładowe dane MQ2
  
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

    removeDevice(): void {
      alert(`Urządzenie ID ${this.deviceId} zostało usunięte.`);
      this.router.navigate(['/client']);
    }
  
    navigateToDeviceList(): void {
      this.router.navigate(['/client']);
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

    ngAfterViewInit(): void {
      this.renderTemperatureChart();
      this.renderMq2Chart();
    }

    renderTemperatureChart(): void {
      const ctx = document.getElementById('temperatureChart') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1 min', '2 min', '3 min', '4 min', '5 min', '6 min', '7 min'],
          datasets: [{
            label: 'Temperatura (°C)',
            data: this.temperatureData,
            borderColor: 'red',
            borderWidth: 2,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            pointRadius: 3,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          scales: {
            y: {
              suggestedMin: Math.min(...this.temperatureData) - 2,
              suggestedMax: Math.max(...this.temperatureData) + 2
            }
          }
        }
      });
    }
  
    renderMq2Chart(): void {
      const ctx = document.getElementById('mq2Chart') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1 min', '2 min', '3 min', '4 min', '5 min', '6 min', '7 min'],
          datasets: [{
            label: 'Stężenie gazu MQ2',
            data: this.mq2Data,
            borderColor: 'blue',
            borderWidth: 2,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            pointRadius: 3,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          scales: {
            y: {
              suggestedMin: Math.min(...this.mq2Data) - 50,
              suggestedMax: Math.max(...this.mq2Data) + 50
            }
          }
        }
      });
    }

}
