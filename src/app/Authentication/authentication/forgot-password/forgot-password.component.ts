import { AuthenticateService } from './../authentication-service/authenticate.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  form = new FormGroup({});

  detailsValid: boolean = true;

  animationStart: boolean = false;

  linkSent: boolean = false;

  constructor(private authenticate: AuthenticateService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  onSubmit() {
    this.animationStart = true;

    let email = this.form.controls['email'].value;

    this.authenticate.forgotPassword(email).subscribe(
      (responseData) => {
        this.detailsValid = true;
        this.linkSent = true;

        setInterval(() => {
          this.animationStart = false;
          this.linkSent = false;
          this.goLogin();
        }, 4000);
      },
      (error) => {
        this.detailsValid = false;
        this.linkSent = false;

        setInterval(() => {
          this.animationStart = false;
          this.linkSent = false;
          this.detailsValid = true;
        }, 4000);
      }
    );
  }

  goLogin() {
    this.authenticate.goLogin();
  }

  goSignup() {
    this.authenticate.goSignup();
  }
}
