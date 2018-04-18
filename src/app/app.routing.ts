import { Router, RouterModule } from '@angular/router';
import { ObservationsListComponent } from './observations-list/observations-list.component';
import { GalleryThumbnailComponent } from './gallery-thumbnail/gallery-thumbnail.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './services/auth-guard.service'
export const routing = RouterModule.forRoot([
  { path: 'observations', component: ObservationsListComponent,  canActivate: [AuthGuard]},
  { path: 'gallery', component: GalleryThumbnailComponent , canActivate: [AuthGuard]},
  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  //{ path: '**', redirectTo: 'not-found' },
])