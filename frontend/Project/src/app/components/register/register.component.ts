import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';  // Dodano właściwość do obsługi komunikatu sukcesu
  

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      const passwordField = document.getElementById('password') as HTMLInputElement;
      passwordField.type = this.showPassword ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
      const confirmPasswordField = document.getElementById('confirmPassword') as HTMLInputElement;
      confirmPasswordField.type = this.showConfirmPassword ? 'text' : 'password';
    }
  }

  // Funkcja do zmiany widoczności hasła
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Hasła nie są identyczne!';
      return;
    }
  
    if (this.authService.register(this.email, this.password)) {
      this.successMessage = 'Rejestracja zakończona sukcesem! Możesz się teraz zalogować.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.errorMessage = 'Nie udało się zarejestrować!';
    }
  }

  // Funkcja nawigacji do widoku niezalogowanego użytkownika
  navigateToUnauthorizedView() {
    this.router.navigate(['/unauthorized']);  // Zmiana ścieżki na odpowiednią stronę
  }
}
