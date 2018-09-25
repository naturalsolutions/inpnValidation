import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
//component
import { ValidationComponent } from './validation/validation.component';
import { GalleryThumbnailComponent } from './gallery-thumbnail/gallery-thumbnail.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { ObservationPageComponent } from './observation-page/observation-page.component';
import { ObsListComponent } from './obs-list/obs-list.component';
import { ObsDetailsComponent } from './obs-details/obs-details.component';
import { FilterComponent } from './filter/filter.component';
import { ObsMapComponent } from './obs-map/obs-map.component';
//service
import { ImagesService } from './services/images.service';
import { ObservationService } from './services/observation.service';
import { LoginService } from './services/login.service';
import { ObsGuard } from './services/obs-guard.service';
import { GalleryGuard } from './services/gallery-guard.service';
import { TextService } from './services/text.service';
import { AuthInterceptor } from './services/authInterceptor';
//routing
import { routing } from './app.routing';
import {icon, Marker} from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/imgs/marker-icon.png';
const shadowUrl = 'assets/imgs/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;


@NgModule({
  declarations: [
    AppComponent,
    ValidationComponent,
    GalleryThumbnailComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    LoginModalComponent,
    ObservationPageComponent,
    ObsListComponent,
    ObsDetailsComponent,
    FilterComponent,
    ObsMapComponent,
 
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    RouterModule,
    NgxSpinnerModule,
    LeafletModule,
    routing
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthInterceptor,
    ImagesService,
    ObservationService,
    LoginService,
    TextService,
    ObsGuard,
    GalleryGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
