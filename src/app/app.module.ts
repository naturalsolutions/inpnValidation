import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ObservationsListComponent } from './observations-list/observations-list.component';
import { NgxSpinnerModule } from 'ngx-spinner';

import { GalleryThumbnailComponent } from './gallery-thumbnail/gallery-thumbnail.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { routing } from './app.routing';
import { HomeComponent } from './home/home.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
//service
import { ImagesService } from './services/images.service';
import { ObservationService } from './services/observation.service';
import { LoginService } from './services/login.service';
import { AuthGuard } from './services/auth-guard.service'
import { AuthInterceptor } from './services/authInterceptor';


@NgModule({
  declarations: [
    AppComponent,
    ObservationsListComponent,
    GalleryThumbnailComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    LoginModalComponent,
 
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
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
