import { switchMap } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthCheckInterceptor implements HttpInterceptor {

  constructor(private cookie: CookieService, private http: HttpClient) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    let isAuthRefresh: any = request.body;
    
    if(isAuthRefresh){
      let x = isAuthRefresh['grant_type'];
      if(x){        
        return next.handle(request);
      }
    }

    let id :any[] = this.cookie.get('id-chat').split(','); 

    if(id[2] <= (new Date().getTime())){
      return this.refreshId(id).pipe(
        switchMap((data: any)=>{
          let id:any = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];
        
          this.cookie.set('id-chat', id);

          let url = request.url;
          if(url.indexOf('chat')!=-1){
            request = request.clone({
              params: new HttpParams().set('auth', id[0]),
            })
          }
          else{
            request = request.clone({body: {idToken: id[0]}});
          }

          return next.handle(request);
        })
      );
    }
    else {      
      return next.handle(request);
    }
  }

  refreshId(data: any){
    return this.http.post('https://securetoken.googleapis.com/v1/token?key=' + environment.firebaseConfig.apiKey,
    {
      grant_type: "refresh_token",
      refresh_token: data[1],
    })
  }
}
