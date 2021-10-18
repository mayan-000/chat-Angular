import { switchMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { AuthenticateService } from 'src/app/Authentication/authentication/authentication-service/authenticate.service';

@Injectable({
  providedIn: 'root'
})
export class RecentChatExtractorService {

  uid:string = "";
  api = "AIzaSyCBcQkncvumoMqwEqB5UawcH5ZYG7KUFQ0";

  constructor(private cookie: CookieService, private http: HttpClient, private authenticate: AuthenticateService) { }

  extract(){
    let id :any[] = this.cookie.get('id-chat').split(',');    
    if(id[2] <= (new Date().getTime())){
      return this.authenticate.refreshId(id)
      .pipe(switchMap((data: any)=>{
        let id:any = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];
        
        this.cookie.set('id-chat', id);

        return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + this.api,
        {
          idToken: id[0],
        })}),
        switchMap((data:any)=>{
          this.uid = data.users[0].localId;
          
          return this.extractMessages(id);
        }),
        catchError(error=>{
          return throwError(error);
        }));
    }
    
    return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + this.api,
    {
      idToken: id[0],
    })
    .pipe(switchMap((data:any)=>{
      this.uid = data.users[0].localId;
      
      return this.extractMessages(id);
    }),
    catchError(error=>{
      return throwError(error);
    }))
  }

  private extractMessages(id: any){
    return this.http.get(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}.json`, 
    {
      params: new HttpParams().set('auth', id[0]),
    });
  }

  extractAll() {
    let id: any[] = this.cookie.get('id-chat').split(',');

    if(id[2] <= new Date().getTime()){
      return this.authenticate.refreshId(id)
      .pipe(switchMap((data: any)=>{
        let id:any = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];
        
        this.cookie.set('id-chat', id);

        return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + this.api,
        {
          idToken: id[0],
        })}),
        switchMap((data:any)=>{
          this.uid = data.users[0].localId;
          
          return this.extractAllMessages(id);
        }),
        catchError(error=>{
          return throwError(error);
        }));
    }
    
    return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + this.api,
    {
      idToken: id[0],
    })
    .pipe(switchMap((data:any)=>{
      this.uid = data.users[0].localId;
      
      return this.extractAllMessages(id);
    }),
    catchError(error=>{
      return throwError(error);
    }));
  }

  private extractAllMessages(id: any) {
    return this.http.get(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends.json`, 
    {
      params: new HttpParams().set('auth', id[0]),
    });
  }

  sendMessage(message: string, friendUid: string){
    let id: any[] = this.cookie.get('id-chat').split(',');    

    if(id[2] <= new Date().getTime()){
      return this.authenticate.refreshId(id)
      .pipe(switchMap((data: any)=>{
        let id:any = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];
        
        this.cookie.set('id-chat', id);

        return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + this.api,
        {
          idToken: id[0],
        })}),
        switchMap((data: any)=>{
          this.uid = data.users[0].localId;
          
          return this.send(id, message, friendUid);
        }),
        catchError(error=>{
          return throwError(error);
        }));
    }
    
    return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + this.api,
    {
      idToken: id[0],
    })
    .pipe(switchMap((data:any)=>{
      this.uid = data.users[0].localId;
      
      return this.send(id, message, friendUid);

    }),
    catchError(error=>{
      return throwError(error);
    }));
  }


  private send(id: any, message: any, friendUid: any){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    let date = dd + '-' + mm + '-' + yyyy;
    let time = new Date().toTimeString().slice(0, 8);

    return this.http.post(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends/${friendUid}/messages.json`,
    {
      "date": date,
      "time": time,
      "read": 1,
      "message": message,
      "type": "send"
    },
    {
      params: new HttpParams().set('auth', id[0]),
    })
    .pipe(switchMap((data: any)=>{
      return this.http.patch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${friendUid}/friends/${this.uid}/messages/${data.name}.json`,
      {
        "date": date,
        "time": time,
        "read": 0,
        "message": message,
        "type": "receive"
      },
      {
        params: new HttpParams().set('auth', id[0]),
      })
    }),
    switchMap((data: any)=>{
      return this.http.patch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/LastMessages/${friendUid}.json`,
      {
        "date": date,
        "time": time,
        "read": 1,
        "message": message,
        "type": "send"
      },
      {
        params: new HttpParams().set('auth', id[0]),
      })
    }),
    switchMap((data: any)=>{
      return this.http.patch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${friendUid}/LastMessages/${this.uid}.json`,
      {
        "date": date,
        "time": time,
        "read": 0,
        "message": message,
        "type": "receive"
      },
      {
        params: new HttpParams().set('auth', id[0]),
      })
    }));
  }

  updateReadMessage(mID: string, friendUid: string, message: any){
    let id: any[] = this.cookie.get('id-chat').split(',');    

    if(id[2] <= new Date().getTime()){
      this.authenticate.refreshId(id)
      .pipe(switchMap((data: any)=>{
        let id:any = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];
        
        this.cookie.set('id-chat', id);

        return this.http.patch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends/${friendUid}/messages/${mID}.json`,
        {
          "date": message.date,
          "time": message.time,
          "read": 1,
          "message": message.message,
          "type": message.type
        },
        {
          params: new HttpParams().set('auth', id[0]),
        })
      }
      ))
      .subscribe((data)=>{});
    }
    else{
      this.http.patch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/friends/${friendUid}/messages/${mID}.json`,
        {
          "date": message.date,
          "time": message.time,
          "read": 1,
          "message": message.message,
          "type": message.type
        },
        {
          params: new HttpParams().set('auth', id[0]),
        })
      .subscribe((data)=>{});
    }
  }

  updateLast(friendUid: string, message: any){
    let id: any[] = this.cookie.get('id-chat').split(',');  

    if(id[2] <= new Date().getTime()){
      this.authenticate.refreshId(id)
      .pipe(switchMap((data: any)=>{
        let id:any = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];
        
        this.cookie.set('id-chat', id);

        return this.http.patch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/LastMessages/${friendUid}.json`,
        {
          "date": message.date,
          "time": message.time,
          "read": 1,
          "message": message.message,
          "type": message.type
        },
        {
          params: new HttpParams().set('auth', id[0]),
        })
      }
      ))
      .subscribe((data)=>{});
    }
    else{
      this.http.patch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${this.uid}/LastMessages/${friendUid}.json`,
        {
          "date": message.date,
          "time": message.time,
          "read": 1,
          "message": message.message,
          "type": message.type
        },
        {
          params: new HttpParams().set('auth', id[0]),
        })
      .subscribe((data)=>{});
    }
  }
}
