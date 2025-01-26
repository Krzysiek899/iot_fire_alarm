import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private apiUrl = 'http://localhost:3000/api';  // URL do backendu Express.js

  constructor(private http: HttpClient) {}

  // Pobranie listy urządzeń dla zalogowanego użytkownika
  getDevices(): Observable<any> {
    return this.http.get(`${this.apiUrl}/devices`, this.getHeaders());
  }

  // Pobranie danych konkretnego urządzenia
  getDevice(deviceId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/devices/${deviceId}`, this.getHeaders());
  }

  // Zmiana nazwy urządzenia
  updateDeviceName(deviceId: string, newName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/devices/${deviceId}/name`, { newName }, this.getHeaders());
  }

  // Usunięcie urządzenia
  deleteDevice(deviceId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/devices/${deviceId}`, this.getHeaders());
  }

  // Ustawienie progów alarmowych dla urządzenia
  updateThreshold(deviceId: string, type: string, value: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/devices/${deviceId}/threshold/${type}`, { value }, this.getHeaders());
  }

  generate_pairing_token(): Observable<string> {
    return this.http.post<{ token: string }>(
        `${this.apiUrl}/tokens/generate-token`,
        {},  // Pusty obiekt dla zapytań POST bez ciała
        this.getHeaders()
    ).pipe(
        map(response => response.token)  // Ekstrakcja tokena z odpowiedzi
    );
  }

  // Pobieranie tokena z localStorage
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Konfiguracja nagłówków z tokenem
  private getHeaders() {
    const token = this.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }
}
