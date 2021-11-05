import { CookieService } from 'ngx-cookie-service';
import { AuthenticateService } from './Authentication/authentication/authentication-service/authenticate.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  wait: boolean = true;

  constructor(private authenticate: AuthenticateService, private router: Router, private activatedRoute: ActivatedRoute, private cookie: CookieService) {}

  ngOnInit(): void {
    
    this.checkCookie();

    setTimeout(()=>{this.wait = false;},2000);
  }

  checkCookie(){
    let id: any = this.cookie.get('id-chat').split(',');
    

    if(id.length===3 && id[2]<=(new Date().getTime())){
      this.authenticate.refreshId(id)
      .subscribe((data:any)=>{
        let id:any = [data.id_token, data.refresh_token, new Date().getTime()+3600*1000];
        
        this.cookie.set('id-chat', id);
        this.router.navigate(['main']);
      });
    }
    else if(id.length===3){
      this.router.navigate(['main']);
    }
    else{
      this.router.navigate(['authentication']);
    }
  }
}
