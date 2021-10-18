import { switchMap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthenticateService } from 'src/app/Authentication/authentication/authentication-service/authenticate.service';
import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router, private cookie: CookieService, private authenticate: AuthenticateService, private http: HttpClient) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log(route.component);
      console.log(state.url.split('/'));

      let url = state.url.split('/');

      let id = this.cookie.get('id-chat').split(',');

      if(url[1]=="main"){
        
        if(url[3]=="chat"){
          if(+id[2] <= new Date().getTime()){
            return this.authenticate.refreshId(id).pipe(switchMap((data: any)=>{
              let _id = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];

              this.cookie.set('id-chat', _id.toString());

              id = _id;

              return this.http.get(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${url[5]}.json`,{
                params: new HttpParams().set('auth', id[0]),
              })
            }),
            switchMap((data: any)=>{
              if(data==null  || data.username.name!=url[4]) return of(false);
              return of(true);
            }))
          }
          else{
            return this.http.get(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${url[5]}.json`,{
              params: new HttpParams().set('auth', id[0]),
            }).pipe(switchMap((data: any)=>{
              if(data==null || data.username.name!=url[4]) return of(false);
              return of(true);
            })); 
          }
        }
        else if(id.length==3){
          return true;
        }
        else{
          this.router.navigate(['']);
        }

      }
      else if(url[1]=="authentication"){
        if(id.length==3){
          this.router.navigate(['']);
        }
        else{
          return true;
        }
      }

      return true;
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
  
}
