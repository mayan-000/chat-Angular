import { AuthenticateService } from './../authentication-service/authenticate.service';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { switchMap } from "rxjs/operators";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  form = new FormGroup({});

  detailsValid: boolean = true;

  accountCreated: boolean = false;

  animationStart: boolean = false;


  constructor(private authenticate: AuthenticateService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'name': new FormControl("", [Validators.required, this.noSpaceValidator()]),
      'email': new FormControl("", [Validators.required, Validators.email]),
      'password': new FormControl("", [Validators.required, Validators.minLength(8)]),
    });
  }

  onSubmit(){
    this.animationStart = true;

    let email = this.form.controls['email'].value;
    let password = this.form.controls['password'].value;
    let name = this.form.controls['name'].value;


    this.authenticate.signup(email, password)
    .pipe(switchMap(
      (data)=>{
        return this.authenticate.verifyEmail(email, name, data);
      }))
    .subscribe(
      (responseData)=>{
        this.detailsValid = true;
        this.accountCreated = true;

        setInterval(()=>{
          this.goLogin();
        },4000);
      },
      (error)=>{
        this.detailsValid = false;
        setInterval(()=>{
          this.animationStart = false;
          this.detailsValid = true;
          this.accountCreated = false;
        },4000);
      }
    );
  }

  goLogin(){
    this.authenticate.goLogin();
  }

  goForgotPassword(){
    this.authenticate.goForgotPassword();
  }
  
  noSpaceValidator(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;

      if(val.split(' ').length>1){
        return {space: true};
      }

      return null;
    }
  }

}
