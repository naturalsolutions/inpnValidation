import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NgxSpinnerModule } from 'ngx-spinner';
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
import { FilterComponent } from './filter/filter.component';


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
 
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    RouterModule,
    NgxSpinnerModule,
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
