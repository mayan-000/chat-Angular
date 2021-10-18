import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './Authentication/authentication/authentication.component';
import { LoginComponent } from './Authentication/authentication/login/login.component';
import { SignupComponent } from './Authentication/authentication/signup/signup.component';
import { ForgotPasswordComponent } from './Authentication/authentication/forgot-password/forgot-password.component';
import { MainComponent } from './Main-App/main/main.component';
import { HomeComponent } from './Main-App/main/home/home.component';
import { FriendsComponent } from './Main-App/main/friends/friends.component';
import { ProfileComponent } from './Main-App/main/profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ChatComponent } from './Main-App/main/home/chat/chat.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    MainComponent,
    HomeComponent,
    FriendsComponent,
    ProfileComponent,
    ChatComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
