import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxGaugeModule } from 'ngx-gauge';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-device-interface',
  imports: [CommonModule, FormsModule, NgxGaugeModule],
  standalone: true,
  templateUrl: './device-interface.component.html',
  styleUrl: './device-interface.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DeviceInterfaceComponent {
  deviceId!: number;
  temperatureThreshold: number = 30;
  mg2Threshold: number = 50;
  message: string = '';
  
  
  // Zainicjalizowane wartości dla czujników
  temperatureValue: number = 22; 
  mq2Value: number = 150;


  temperatureData: number[] = [22, 23, 24, 23, 25, 26, 27];
  mq2Data: number[] = [100, 120, 150, 130, 160, 170, 180];

  // Observable dla temperatury i MQ2 (symulowane dane)
  temperature$: Observable<number>;
  mq2$: Observable<number>;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe(params => {
      this.deviceId = params['id'];
    });

    // Symulowanie wartości co 2 sekundy
    this.temperature$ = interval(2000).pipe(
      map(() => this.getRandomValue(20, 30))
    );

    this.mq2$ = interval(2000).pipe(
      map(() => this.getRandomValue(100, 300))
    );
  }

  ngOnInit(): void {
    // Inicjalizacja wartości czujników jeśli przyszły z backendu jako null
    this.temperatureValue = this.temperatureValue ?? 22;
    this.mq2Value = this.mq2Value ?? 150;
  }

  getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        aspectRatio: 2
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
        aspectRatio: 2
      }
    });
  }

  saveSettings(): void {
    this.message = `Ustawienia dla urządzenia ID ${this.deviceId} zostały zapisane!`;
  }

  removeDevice(): void {
    alert(`Urządzenie ID ${this.deviceId} zostało usunięte.`);
    this.router.navigate(['/client']);
  }

  navigateToDeviceList(): void {
    this.router.navigate(['/client']);
  }

  onLogout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
