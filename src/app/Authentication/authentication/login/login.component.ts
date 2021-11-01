import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticateService } from './../authentication-service/authenticate.service';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  detailsValid: boolean = true;

  animationStart: boolean = false;

  id: any;

  form: FormGroup = new FormGroup({});

  constructor(private authenticate: AuthenticateService, private cookie: CookieService, private router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'email': new FormControl("", [Validators.email, Validators.required]),
      'password': new FormControl("", [Validators.required, Validators.minLength(8)])
    });
  }

  onSubmit(){
    this.animationStart = true;
    let email = this.form.controls['email'].value;
    let password = this.form.controls['password'].value;
      

    this.authenticate.login(email, password)
    .pipe(switchMap(
      (data:any)=>{        
        this.id = [data.idToken, data.refreshToken, new Date().getTime()+3600*1000];
        
        return this.authenticate.isVerified(data);
      }
    ),
    catchError((error)=>{
      return throwError(error);
    }))
    .subscribe(
      (responseData: any)=>{    
        let verified = responseData.users[0].emailVerified;

        this.detailsValid = verified;

        if(verified){
          this.setCookie();
          this.authenticate.flipAuthenticator(3);
        }
        else{
          setInterval(()=>{
            this.animationStart = false;
            this.detailsValid = true;
          }, 4000);
        }
      },
      (error)=>{
        this.detailsValid = false;

        setInterval(()=>{
          this.animationStart = false;
          this.detailsValid = true;
        }, 4000);
      }
    );
  }

  goSignup(){
    this.authenticate.goSignup();
  }

  goForgotPassword(){
    this.authenticate.goForgotPassword();
  }

  setCookie(){
    // console.log('cookie');
    
    this.cookie.set('id-chat', this.id);
  }
}
