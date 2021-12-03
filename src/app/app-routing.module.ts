import { AuthGuardGuard } from './auth-guard.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { ChatComponent } from './Main-App/main/home/chat/chat.component';
import { MainComponent } from './Main-App/main/main.component';
import { LoginComponent } from './Authentication/authentication/login/login.component';
import { ForgotPasswordComponent } from './Authentication/authentication/forgot-password/forgot-password.component';
import { SignupComponent } from './Authentication/authentication/signup/signup.component';
import { ProfileComponent } from './Main-App/main/profile/profile.component';
import { FriendsComponent } from './Main-App/main/friends/friends.component';
import { HomeComponent } from './Main-App/main/home/home.component';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './Authentication/authentication/authentication.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  {
    path: 'authentication',
    component: AuthenticationComponent,
    canActivate: [AuthGuardGuard],
    canActivateChild: [AuthGuardGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
    ],
  },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuardGuard],
    canActivateChild: [AuthGuardGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        children: [{ path: 'chat/:friend/:uid', component: ChatComponent }],
      },
      { path: 'friends', component: FriendsComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
