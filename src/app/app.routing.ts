import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ObsGuard } from './services/obs-guard.service';
import { ObservationPageComponent } from './observation-page/observation-page.component';
import { ObsDetailsComponent } from './obs-details/obs-details.component';

export const routing = RouterModule.forRoot([
  { path: 'observations', component: ObservationPageComponent },
  { path: 'home', component: HomeComponent },
  { path: 'details/:id', component: ObsDetailsComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'home' },
], { useHash: true })