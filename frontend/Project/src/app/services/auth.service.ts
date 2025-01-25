import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  register(email: string, password: string): boolean {
    // Sprawdzenie, czy użytkownik już istnieje
    if (localStorage.getItem(email)) {
      console.error('Użytkownik już istnieje!');
      return false;
    }

    // Zapis danych użytkownika w localStorage
    localStorage.setItem(email, JSON.stringify({ email, password }));
    console.log('Użytkownik zarejestrowany:', email);
    return true;
  }

  login(email: string, password: string): boolean {
    const userData = localStorage.getItem(email);
    if (!userData) {
      console.error('Nie znaleziono użytkownika');
      return false;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.password === password) {
      localStorage.setItem('user', JSON.stringify({ email }));
      console.log('Zalogowano pomyślnie:', email);
      return true;
    } else {
      console.error('Nieprawidłowe hasło');
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    console.log('Użytkownik został wylogowany');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('user') !== null;
  }
}
