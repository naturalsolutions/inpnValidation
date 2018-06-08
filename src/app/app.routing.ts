import { Router, RouterModule } from '@angular/router';
import { ObservationsListComponent } from './observations-list/observations-list.component';
import { GalleryThumbnailComponent } from './gallery-thumbnail/gallery-thumbnail.component';
import { HomeComponent } from './home/home.component';
import { ObsGuard } from './services/obs-guard.service';
import { GalleryGuard } from './services/gallery-guard.service'
import { ValidationPageComponent } from './validation-page/validation-page.component';

export const routing = RouterModule.forRoot([
  { path: 'observations', component: ObservationsListComponent,  canActivate: [ObsGuard]},
  { path: 'gallery', component: GalleryThumbnailComponent , canActivate: [GalleryGuard]},  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'home' },
],{ useHash: true })