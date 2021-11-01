import { AuthenticateService } from './authentication-service/authenticate.service';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  authenticatorSelector: number = 0;

  wait: boolean = true;

  constructor(private cookie: CookieService, private authenticator: AuthenticateService, private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.navigate(['login'], {relativeTo: this.activeRoute})
    
    setTimeout(()=>{this.wait = false},1000);

    this.authenticator.flip.subscribe((data)=>{
      this.authenticatorSelector = data;

      if(data==0) {
        this.router.navigate(['login'], {relativeTo: this.activeRoute});
      }
      if(data==1){
        this.router.navigate(['signup'], {relativeTo: this.activeRoute});
      }
      if(data==2){
        this.router.navigate(['forgot-password'], {relativeTo: this.activeRoute});
      }
      if(data==3){
        this.router.navigate(['../'], {relativeTo: this.activeRoute});
      }
    })
  }

}
