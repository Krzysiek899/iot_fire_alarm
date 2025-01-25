import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; //importowanie serwisu uwierzytelniania
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true, //komponent jest samodzielnym komponentem
  imports: [CommonModule, FormsModule,RouterModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  showConfirmPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  // Funkcja do zmiany widoczności hasła
  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      const passwordField = document.getElementById('password') as HTMLInputElement;
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }

  // Funkcja nawigacji do widoku niezalogowanego użytkownika
  navigateToUnauthorizedView() {
    this.router.navigate(['/unauthorized']);  // Zmiana ścieżki na odpowiednią stronę
  }
  
  onLogin(): void {
    if (this.authService.login(this.email, this.password)) {
      this.router.navigate(['/client']);
    } else {
      this.errorMessage = 'Nieprawidłowy email lub hasło!';
    }
  }
}
