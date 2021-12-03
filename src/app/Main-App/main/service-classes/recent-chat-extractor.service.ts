import { environment } from './../../../../environments/environment';
import { switchMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { AuthenticateService } from 'src/app/Authentication/authentication/authentication-service/authenticate.service';

@Injectable({
  providedIn: 'root',
})
export class RecentChatExtractorService {
  uid: string = '';

  sse: any;

  allMessagesSse: any;

  lastMessagesSubject = new Subject<any>();

  allMessagesSubject = new Subject<any>();

  constructor(
    private cookie: CookieService,
    private http: HttpClient,
    private authenticate: AuthenticateService
  ) {}

  _extractAll(friendUid: string) {
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
          environment.firebaseConfig.apiKey,
        {
          idToken: id[0],
        }
      )
      .subscribe((data: any) => {
        this.uid = data.users[0].localId;
        let id: any[] = this.cookie.get('id-chat').split(',');

        this.allMessagesSse = new EventSource(
          `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends/${friendUid}.json?auth=${id[0]}`
        );

        this.allMessagesSse.addEventListener(
          'patch',
          (e: any) => {
            this.allMessagesSubject.next({
              patch: JSON.parse(e.data),
              put: null,
              auth_revoked: false,
            });
          },
          false
        );

        this.allMessagesSse.addEventListener(
          'put',
          (e: any) => {
            this.allMessagesSubject.next({
              put: JSON.parse(e.data),
              patch: null,
              auth_revoked: false,
            });
          },
          false
        );

        this.allMessagesSse.addEventListener(
          'auth_revoked',
          (e: any) => {
            this.allMessagesSubject.next({
              auth_revoked: true,
              put: null,
              patch: null,
            });
          },
          false
        );
      });
  }

  _extract() {
    let id: any[] = this.cookie.get('id-chat').split(',');

    return this.http
      .post(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' +
          environment.firebaseConfig.apiKey,
        {
          idToken: id[0],
        }
      )
      .subscribe((data: any) => {
        this.uid = data.users[0].localId;
        let id: any[] = this.cookie.get('id-chat').split(',');

        this.sse = new EventSource(
          `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/LastMessages/.json?auth=${id[0]}`
        );

        this.sse.addEventListener(
          'patch',
          (e: any) => {
            this.lastMessagesSubject.next({ patch: JSON.parse(e.data) });
          },
          false
        );

        this.sse.addEventListener(
          'put',
          (e: any) => {
            this.lastMessagesSubject.next({ put: JSON.parse(e.data) });
          },
          false
        );

        this.sse.addEventListener(
          'auth_revoked',
          (e: any) => {
            this.lastMessagesSubject.next({ auth_revoked: true });
          },
          false
        );
      });
  }

  sendMessage(message: string, friendUid: string) {
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

          return this.send(id, message, friendUid);
        }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  private send(id: any, message: any, friendUid: any) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    let date = dd + '-' + mm + '-' + yyyy;
    let time = new Date().toTimeString().slice(0, 8);

    return this.http
      .post(
        `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends/${friendUid}/messages.json`,
        {
          date: date,
          time: time,
          read: 1,
          message: message,
          type: 'send',
        },
        {
          params: new HttpParams().set('auth', id[0]),
        }
      )
      .pipe(
        switchMap((data: any) => {
          return this.http.patch(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${friendUid}/friends/${this.uid}/messages/${data.name}.json`,
            {
              date: date,
              time: time,
              read: 0,
              message: message,
              type: 'receive',
            },
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap((data: any) => {
          return this.http.patch(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/LastMessages/${friendUid}.json`,
            {
              date: date,
              time: time,
              read: 1,
              message: message,
              type: 'send',
            },
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        }),
        switchMap((data: any) => {
          return this.http.patch(
            `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${friendUid}/LastMessages/${this.uid}.json`,
            {
              date: date,
              time: time,
              read: 0,
              message: message,
              type: 'receive',
            },
            {
              params: new HttpParams().set('auth', id[0]),
            }
          );
        })
      );
  }

  updateReadMessage(mID: string, friendUid: string, message: any) {
    let id: any[] = this.cookie.get('id-chat').split(',');

    if (message.type == 'receive') {
      this.http
        .patch(
          `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends/${friendUid}/messages/${mID}.json`,
          {
            date: message.date,
            time: message.time,
            read: 1,
            message: message.message,
            type: message.type,
          },
          {
            params: new HttpParams().set('auth', id[0]),
          }
        )
        .subscribe((data) => {});
    }
  }

  updateLast(friendUid: string, message: any) {
    let id: any[] = this.cookie.get('id-chat').split(',');

    if (message.type == 'receive') {
      this.http
        .patch(
          `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/LastMessages/${friendUid}.json`,
          {
            date: message.date,
            time: message.time,
            read: 1,
            message: message.message,
            type: message.type,
          },
          {
            params: new HttpParams().set('auth', id[0]),
          }
        )
        .subscribe((data) => {});
    }
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
}
