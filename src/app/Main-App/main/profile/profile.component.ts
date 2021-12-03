import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FriendsExtractorService } from '../service-classes/friends-extractor.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  changeName: boolean = false;
  @ViewChild('popUp') popUp!: ElementRef;

  name: string = "";
  email: string = "";
  wait = true;

  constructor(private cookie: CookieService, private router: Router, private extractor: FriendsExtractorService) { }

  ngOnInit(): void {
    this.findDetails();
  }

  logout(){
    this.cookie.delete('id-chat');
    this.router.navigate(['']);
  }

  pop(){
    this.changeName = !this.changeName;
    
    this.popUp.nativeElement.style.display = (this.changeName? "block": "none");

    if(this.changeName) {
      this.popUp.nativeElement.classList
    }
  }

  findDetails(){
    this.extractor.extractMe()
    .subscribe((data: any)=>{
      this.name = data[0];
      this.email = data[1];
      this.wait = false;
    })
  }

  changeUserName(_name: HTMLInputElement){    
    if(_name.value.split(' ').length==1){
      this.name = _name.value;
      this.extractor.changeName(this.name);
      this.pop();
    }
    else{
      _name.style.border = '3px red solid';
      _name.value = "";
      _name.placeholder = "No Spaces Please!";
    }
    
  }

}
