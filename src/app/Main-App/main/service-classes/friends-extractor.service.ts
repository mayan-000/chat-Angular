import { environment } from './../../../../environments/environment';
import { switchMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthenticateService } from 'src/app/Authentication/authentication/authentication-service/authenticate.service';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendsExtractorService {
  uid: string = '';
  api = 'AIzaSyCBcQkncvumoMqwEqB5UawcH5ZYG7KUFQ0';

  nameExtractor = async (data: any, list: any[]) => {
    let id = this.cookie.get('id-chat').split(',');

    let x: any = await fetch(
      `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${data}/username/name.json?auth=${id[0]}`,
      {
        method: 'GET',
      }
    );

    let y = await x.json();

    list.push({ name: y, uid: data });
  };

  constructor(
    private cookie: CookieService,
    private authenticate: AuthenticateService,
    private http: HttpClient
  ) {}

  extractFriends() {
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
          environment.firebaseConfig.apiKey,
        {
          idToken: id[0],
        }
      )
      .pipe(
        switchMap((data: any) => {
          this.uid = data.users[0].localId;
          return this._extractFriends(id);
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  private _extractFriends(id: any) {
    let friendsDetails: any = [];

    return this.http
      .get(
        `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends.json`,
        {
          params: new HttpParams().set('auth', id[0]),
        }
      )
      .pipe(
        switchMap(async (data: any) => {
          for (const key in data) {
            await this.nameExtractor(key, friendsDetails);
          }

          //

          return of(friendsDetails);
        })
      );
  }

  extractRequests() {
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
          environment.firebaseConfig.apiKey,
        {
          idToken: id[0],
        }
      )
      .pipe(
        switchMap((data: any) => {
          this.uid = data.users[0].localId;
          return this._extractRequests();
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  private _extractRequests() {
    let requestsDetails: any[] = [];
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .get(
        `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/requestsReceived.json`,
        {
          params: new HttpParams().set('auth', id[0]),
        }
      )
      .pipe(
        switchMap(async (data: any) => {
          for (const key in data) {
            await this.nameExtractor(data[key].uid, requestsDetails);
          }
          //
          return of(requestsDetails);
        })
      );
  }

  extractSuggestions() {
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
          environment.firebaseConfig.apiKey,
        {
          idToken: id[0],
        }
      )
      .pipe(
        switchMap((data: any) => {
          this.uid = data.users[0].localId;
          return this._extractSuggestions();
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  private _extractSuggestions() {
    let suggestionsDetails: any[] = [];
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .get(`https://chat-4dbb2-default-rtdb.firebaseio.com/users.json`, {
        params: new HttpParams().set('auth', id[0]),
      })
      .pipe(
        switchMap(async (data: any) => {
          for (const key in data) {
            await this.nameExtractor(key, suggestionsDetails);
          }
          //
          return of(suggestionsDetails);
        })
      );
  }

  lookup() {
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http.post(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
        environment.firebaseConfig.apiKey,
      {
        idToken: id[0],
      }
    );
  }

  acceptRequest(request: any) {
    let id: any[] = this.cookie.get('id-chat').split(',');
    let _key = '';

    this.http
      .get(
        `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/requestsReceived.json`,
        {
          params: new HttpParams().set('auth', id[0]),
        }
      )
      .pipe(
        switchMap((data: any) => {
          for (const key in data) {
            if (data[key].uid === request.uid) {
              _key = key;
              break;
            }
          }

          return this.http.delete(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/requestsReceived/${_key}.json`,
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap(() => {
          return this.http.get(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${request.uid}/requestsSent.json`,
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap((data: any) => {
          for (const key in data) {
            if (data[key].uid == this.uid) {
              _key = key;
              break;
            }
          }

          return this.http.delete(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${request.uid}/requestsSent/${_key}.json`,
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap(() => {
          return this.http.patch(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${request.uid}/friends/${this.uid}.json`,
            {
              becameFriendsAt: new Date(),
            },
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap((data: any) => {
          return this.http.patch(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends/${request.uid}.json`,
            {
              becameFriendsAt: new Date(),
            },
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        })
      )
      .subscribe((data: any) => {});
  }

  addFriend(suggestion: { name: string; uid: string }) {
    let id: any[] = this.cookie.get('id-chat').split(',');

    this.http
      .post(
        `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/requestsSent.json`,
        {
          uid: suggestion.uid,
        },
        {
          params: new HttpParams().set('auth', id[0]),
        }
      )
      .pipe(
        switchMap((data: any) => {
          return this.http.post(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${suggestion.uid}/requestsReceived.json`,
            {
              uid: this.uid,
            },
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        })
      )
      .subscribe((data) => {});
  }

  extractMe() {
    let name = '';
    let email = '';

    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
          environment.firebaseConfig.apiKey,
        {
          idToken: id[0],
        }
      )
      .pipe(
        switchMap((data: any) => {
          this.uid = data.users[0].localId;

          return this.http.get(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/username/name.json`,
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap((data: any) => {
          name = data;

          return this.http.get(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/userEmail/email.json`,
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap((data: any) => {
          email = data;

          return of([name, email]);
        })
      );
  }

  changeName(name: string) {
    let id: any[] = this.cookie.get('id-chat').split(',');

    this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
          environment.firebaseConfig.apiKey,
        {
          idToken: id[0],
        }
      )
      .pipe(
        switchMap((data: any) => {
          this.uid = data.users[0].localId;

          return this.http.put(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/username.json`,
            {
              name: name,
            },
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        })
      )
      .subscribe((data) => {});
  }
}
