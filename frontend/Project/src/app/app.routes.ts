import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ClientInterfaceComponent } from './components/client-interface/client-interface.component';
import { GuestComponent } from './components/guest/guest.component';
import { DeviceInterfaceComponent } from './components/device-interface/device-interface.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: GuestComponent  // Domyślna strona (gościa)
  },
  {
    path: 'login',
    component: LoginComponent  // Strona logowania
  },
  {
    path: 'register',
    component: RegisterComponent  // Strona rejestracji
  },
  {
    path: 'client',
    component: ClientInterfaceComponent,  // Interfejs klienta dostępny po zalogowaniu
    canActivate: [authGuard]  // Zabezpieczenie trasy przed nieautoryzowanym dostępem
  },
  {
    path: 'device-interface/:id',
    component: DeviceInterfaceComponent,  // Interfejs urządzenia
    canActivate: [authGuard]  // Zabezpieczenie trasy
  },
  {
    path: '**',
    redirectTo: ''  // Przekierowanie do strony głównej w przypadku nieznanej ścieżki
  }
];
