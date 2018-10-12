import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GalleryGuard } from './services/gallery-guard';
import { GrpSimpleGuard } from './services/grpSimple-guard';
import { GrpTaxoGuard } from './services/grpTaxo-guard';
import { EspeceGuard } from './services/espece-guard';
import { ObsDetailsComponent } from './obs-details/obs-details.component';
import { ObsMapComponent } from './obs-map/obs-map.component';
import { ObsListComponent } from './obs-list/obs-list.component';
import { ValidationEspeceComponent } from './validation/validation-espece/validation-espece.component';
import { ValidationGroupetaxoComponent } from './validation/validation-groupetaxo/validation-groupetaxo.component';
import { ValidationGroupesimpleComponent } from './validation/validation-groupesimple/validation-groupesimple.component';
import { GalleryThumbnailComponent } from './gallery-thumbnail/gallery-thumbnail.component';
export const routing = RouterModule.forRoot([

  { path: 'home', component: HomeComponent },
  { path: 'observations/list', component: ObsListComponent, runGuardsAndResolvers: 'always' },
  { path: 'observations/detail/:id', component: ObsDetailsComponent },
  { path: 'observations/carte', component: ObsMapComponent },
  { path: 'observations/validation/photo', component: GalleryThumbnailComponent ,canActivate :[GalleryGuard]},
  { path: 'observations/validation/espece', component: ValidationEspeceComponent,canActivate :[EspeceGuard]},
  { path: 'observations/validation/groupeTaxonomique', component: ValidationGroupetaxoComponent,canActivate :[GrpTaxoGuard]},
  { path: 'observations/validation/groupeSimple', component:  ValidationGroupesimpleComponent,canActivate :[GrpSimpleGuard]},

 
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: 'home' },
], { useHash: true, onSameUrlNavigation: 'reload' })



