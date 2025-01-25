import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ClientInterfaceComponent } from './components/client-interface/client-interface.component';
import { GuestComponent } from './components/guest/guest.component';
import { DeviceInterfaceComponent } from './components/device-interface/device-interface.component';

export const routes: Routes = [
{
    path: '',
    component: GuestComponent  // Domyślna strona to "guest"
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
  },
  {
    path: 'device-interface/:id',
    component: DeviceInterfaceComponent,  // Interfejs klienta dostępny po zalogowaniu
  },
  {
    path: '**',
    redirectTo: ''  // W przypadku nieznanej ścieżki przekierowanie na stronę główną (guest)
  }
];