import { environment } from './../../../../environments/environment';
import { switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticateService implements OnInit {
  flip = new Subject<number>();

  constructor(private http: HttpClient, private cookie: CookieService) {}

  ngOnInit(): void {}

  login(email: string, password: string) {
    return this.http.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
        environment.firebaseConfig.apiKey,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );
  }

  signup(email: string, password: string) {
    return this.http.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
        environment.firebaseConfig.apiKey,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );
  }

  forgotPassword(email: string) {
    return this.http.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' +
        environment.firebaseConfig.apiKey,
      {
        requestType: 'PASSWORD_RESET',
        email: email,
      }
    );
  }

  verifyEmail(email: string, name: string, data: any) {
    let uid = '';
    return this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' +
          environment.firebaseConfig.apiKey,
        {
          requestType: 'VERIFY_EMAIL',
          idToken: data.idToken,
        }
      )
      .pipe(
        switchMap((response: any) => {
          return this.http.post(
            'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
              environment.firebaseConfig.apiKey,
            {
              idToken: data.idToken,
            }
          );
        }),
        switchMap((response: any) => {
          uid = response.users[0].localId;
          return this.http.put(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${uid}/username.json`,
            {
              name: name,
            },
            {
              params: new HttpParams().set('auth', data.idToken),
            }
          );
        }),
        switchMap((response: any) => {
          return this.http.put(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${uid}/userEmail.json`,
            {
              email: email,
            },
            {
              params: new HttpParams().set('auth', data.idToken),
            }
          );
        })
      );
  }

  isVerified(data: any) {
    return this.http.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
        environment.firebaseConfig.apiKey,
      {
        idToken: data.idToken,
      }
    );
  }

  refreshId(data: any) {
    return this.http.post(
      'https://securetoken.googleapis.com/v1/token?key=' +
        environment.firebaseConfig.apiKey,
      {
        grant_type: 'refresh_token',
        refresh_token: data[1],
      }
    );
  }

  flipAuthenticator(flipNumber: number) {
    this.flip.next(flipNumber);
  }

  goLogin() {
    this.flip.next(0);
  }

  goSignup() {
    this.flip.next(1);
  }

  goForgotPassword() {
    this.flip.next(2);
  }
}
