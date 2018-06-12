import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ObsGuard } from './services/obs-guard.service';
import { ValidationPageComponent } from './validation-page/validation-page.component';

export const routing = RouterModule.forRoot([
  { path: 'observations', component: ValidationPageComponent, canActivate: [ObsGuard] },
  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'home' },
], { useHash: true })