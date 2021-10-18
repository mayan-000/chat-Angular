import { RecentChatModel } from './../helper-classes/recent-chat-model';
import { CookieService } from 'ngx-cookie-service';
import { RecentChatExtractorService } from './../service-classes/recent-chat-extractor.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  recentChats:any[] = [];

  wait: boolean  = true;

  ChatClicked: boolean = false;

  clear: any;

  constructor(private recentChat: RecentChatExtractorService, private cookie: CookieService) { }
  ngOnDestroy(): void {
    clearInterval(this.clear);
  }

  ngOnInit(): void {
    this.clear = setInterval(()=>{
      this.recentChat.extract()
      .subscribe((data: any)=>{      
      this.extractNames(data.LastMessages).then((data:any)=>{
        this.recentChats = data; 
        this.recentChats.sort((a: any, b: any)=>{
          
          if(a.time==b.time){       //////     
            return (a.date< b.date? -1:1);
          }
          return (a.time<b.time? -1:1);
        })

        this.wait = false;
      })
    });
    },500);
  }

  async extractNames(data: any) {
    let chats: any[] = [];
    for (const key in data) {
      let id = this.cookie.get('id-chat').split(',');
      
      let x:any = await fetch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${key}/username.json?auth=${id[0]}`, {
        method: 'GET',
      });
      
      let y = await x.json();
      
      chats.push(new RecentChatModel(y.name, key, data[key].date, data[key].time, data[key].message, data[key].read, data[key].type, ("https://avatars.dicebear.com/api/initials/"+ y.name +".svg")));
    }
    return chats;
  }
}

