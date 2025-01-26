// import { Injectable } from '@angular/core';
// import { connect, MqttClient } from 'mqtt';
// import { BehaviorSubject } from 'rxjs';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class MqttService {
//   private client: MqttClient | null = null;
//   private isConnected: boolean = false;
//
//   // BehaviorSubjects do przechowywania wartości czujników
//   public temperature$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
//   public smoke$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
//
//   constructor() {
//     this.connectToBroker();
//   }
//
//   private connectToBroker(): void {
//     const options = {
//       clean: true,
//       connectTimeout: 4000,
//       username: '', // Podaj dane, jeśli są wymagane
//       password: ''
//     };
//
//     this.client = connect('mqtt//localhost:1883', options);
//
//     this.client.on('connect', () => {
//       console.log('Połączono z brokerem MQTT');
//       this.isConnected = true;
//     });
//
//     this.client.on('error', (err) => {
//       console.error('Błąd połączenia MQTT:', err);
//     });
//
//     this.client.on('message', (topic, message) => {
//       console.log(`Otrzymano dane z MQTT: ${topic}: ${message.toString()}`);
//       this.handleIncomingData(topic, message.toString());
//     });
//   }
//
//   subscribeToTopics(temperatureTopic: string, smokeTopic: string): void {
//     if (this.client && this.isConnected) {
//       this.client.subscribe([temperatureTopic, smokeTopic], (err) => {
//         if (!err) {
//           console.log(`Zasubskrybowano tematy: ${temperatureTopic}, ${smokeTopic}`);
//         } else {
//           console.error('Błąd subskrypcji:', err);
//         }
//       });
//     }
//   }
//
//   private handleIncomingData(topic: string, message: string): void {
//     const value = parseFloat(message);
//     if (topic.includes('temperature')) {
//       this.temperature$.next(value);
//     } else if (topic.includes('smoke')) {
//       this.smoke$.next(value);
//     }
//   }
//
//   disconnect(): void {
//     if (this.client) {
//       this.client.end();
//       console.log('Rozłączono z brokerem MQTT');
//     }
//   }
// }
