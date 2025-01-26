// device-interface.component.ts
import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxGaugeModule } from 'ngx-gauge';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { Device } from '../../models/device.model'; // Upewnij się, że masz interfejs Device
import { Subscription, interval } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { map } from 'rxjs/operators';
import {
  Chart,
  registerables,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend, ChartOptions
} from 'chart.js';


@Component({
  selector: 'app-device-interface',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxGaugeModule],
  templateUrl: './device-interface.component.html',
  styleUrls: ['./device-interface.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DeviceInterfaceComponent implements OnInit, OnDestroy, AfterViewInit {
  deviceId!: string;
  temperatureThreshold: number = 30;
  mg2Threshold: number = 50;
  co2Threshold: number = 400; // Dodany próg CO2
  device: Device | undefined;
  message: string = '';
  alarmMessage: string = '';

  // Wartości czujników
  temperatureValue: number = 22;
  mq2Value: number = 150;

  // Dane do wykresów
  temperatureData: number[] = [];
  mq2Data: number[] = [];
  chartLabels: string[] = [];

  // Referencje do wykresów
  temperatureChart!: Chart;
  mq2Chart!: Chart;

  // Subskrypcje
  private subscriptions: Subscription = new Subscription();

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    // Pobranie ID urządzenia z parametrów trasy
    this.subscriptions.add(
        this.route.params.subscribe(params => {
          this.deviceId = params['id'];
          this.fetchDeviceData();
        })
    );
  }

    // Inicjalizacja wykresów
  ngAfterViewInit(): void {
      //this.initializeCharts()


    // Symulowanie odbioru danych sensorów co 2 sekundy
    this.subscriptions.add(
        interval(2000).pipe(
            map(() => this.getRandomValue(20, 30))
        ).subscribe(value => {
          this.updateTemperature(value);
        })
    );

    this.subscriptions.add(
        interval(2000).pipe(
            map(() => this.getRandomValue(100, 300))
        ).subscribe(value => {
          this.updateMq2(value);
        })
    );

    // Symulowanie alarmów co 10 sekund
    // this.subscriptions.add(
    //     interval(10000).subscribe(() => {
    //       this.triggerAlarm(`Alarm na urządzeniu ID ${this.deviceId} o godzinie ${new Date().toLocaleTimeString()}`);
    //     })
    // );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchDeviceData(): void {
    this.deviceService.getDevice(this.deviceId).subscribe({
      next: (device: Device) => {
        this.device = device;
        // Możesz również zainicjalizować inne dane urządzenia tutaj
      },
      error: (err) => {
        console.error('Błąd podczas pobierania danych urządzenia:', err);
        this.message = 'Nie udało się pobrać danych urządzenia.';
      }
    });
  }

  initializeCharts(): void {
    const tempCtx = document.getElementById('temperatureChart') as HTMLCanvasElement;
    const mq2Ctx = document.getElementById('mq2Chart') as HTMLCanvasElement;

    if (!tempCtx || !mq2Ctx) {
      console.error('Canvas element not found!');
      return;
    }

    this.temperatureChart = new Chart(tempCtx, {
      type: 'line',
      data: {
        labels: this.chartLabels,
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
      options: this.getChartOptions()
    });

    this.mq2Chart = new Chart(mq2Ctx, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: [{
          label: 'Stężenie gazu MQ2 (ppm)',
          data: this.mq2Data,
          borderColor: 'blue',
          borderWidth: 2,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          pointRadius: 3,
          tension: 0.3
        }]
      },
      options: this.getChartOptions()
    });
  }


  getChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Czas'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Wartość'
          },
          beginAtZero: true
        }
      }
    };
  }

  getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateTemperature(value: number): void {
    console.log("UpdateTemperature", value);
    this.temperatureValue = value;
    this.temperatureData.push(value);
    if (this.temperatureData.length > 7) {
      this.temperatureData.shift();
    }
    this.temperatureChart?.update();
  }

  updateMq2(value: number): void {
    console.log("UpdateMq2", value);
    this.mq2Value = value;
    this.mq2Data.push(value);
    if (this.mq2Data.length > 7) {
      this.mq2Data.shift();
    }
    this.mq2Chart?.update();
  }


  triggerAlarm(message: string): void {
    this.alarmMessage = message;
    // Możesz dodać dodatkowe logiki, np. powiadomienia toast
  }

  saveSettings(): void {
    // Aktualizacja progów w backendzie
    this.deviceService.updateThreshold(this.deviceId, 'temperature', this.temperatureThreshold).subscribe({
      next: () => {
        this.message = `Próg temperatury został zaktualizowany!`;
      },
      error: (err) => {
        console.error('Błąd podczas aktualizacji progu temperatury:', err);
        this.message = 'Nie udało się zaktualizować progu temperatury.';
      }
    });

    this.deviceService.updateThreshold(this.deviceId, 'smoke', this.mg2Threshold).subscribe({
      next: () => {
        this.message += ` Próg czujnika MQ2 został zaktualizowany!`;
      },
      error: (err) => {
        console.error('Błąd podczas aktualizacji progu MQ2:', err);
        this.message += ' Nie udało się zaktualizować progu MQ2.';
      }
    });

    this.deviceService.updateThreshold(this.deviceId, 'co2', this.co2Threshold).subscribe({
      next: () => {
        this.message += ` Próg CO2 został zaktualizowany!`;
      },
      error: (err) => {
        console.error('Błąd podczas aktualizacji progu CO2:', err);
        this.message += ' Nie udało się zaktualizować progu CO2.';
      }
    });
  }

  dismissAlarm(): void {
    this.alarmMessage = '';  // Usuwa komunikat alarmu
  }


  navigateToDeviceList(): void {
    this.router.navigate(['/devices']);
  }

  onLogout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
