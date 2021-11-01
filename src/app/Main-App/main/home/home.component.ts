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
  

  constructor(private recentChat: RecentChatExtractorService, private cookie: CookieService) { }
  ngOnDestroy(): void {
    this.recentChat.sse.close();
  }

  ngOnInit(): void {
    this.recentChat._extract();

    this.recentChat.lastMessagesSubject.subscribe((data: any)=>{
      
      if(data.patch){
        let friendUid = data.patch.path.split('/')[1];
        for (const chat of this.recentChats) {
          if(chat.uid == friendUid){
            for (const key in data.patch.data) {
              chat[key] = data.patch.data[key];
            }
            break;
          }
        }
        this.recentChats.sort(this.cmp);
      }
      else if(data.put){
        this.extractNames(data.put).then((data: any)=>{
          this.recentChats.push(...data);
          
          this.wait = false;
        })
      }
      else{
        this.recentChat.sse.close();
        this.recentChat._extract();
      }
    })
  }

  async extractNames(_data: any) {
    let chats: any[] = [];
    let id = this.cookie.get('id-chat').split(',');

    let data = _data.data;

    if(_data.path=='/'){
      for (const key in data) {
        let x:any = await fetch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${key}/username.json?auth=${id[0]}`, {
          method: 'GET',
        });
        // 
        let y = await x.json(); 
        
        chats.push(new RecentChatModel(y.name, key, data[key].date, data[key].time, data[key].message, data[key].read, data[key].type, ("https://avatars.dicebear.com/api/initials/"+ y.name +".svg")));
      }
  
      chats.sort(this.cmp);
    }
    else{
      let friendUid = _data.path.split('/')[1];

      let x:any = await fetch(`https://chat-4dbb2-default-rtdb.firebaseio.com/users/${friendUid}/username.json?auth=${id[0]}`, {
          method: 'GET',
        });
        
        let y = await x.json(); 
        // 
        chats.push(new RecentChatModel(y.name, friendUid, data.date, data.time, data.message, data.read, data.type, ("https://avatars.dicebear.com/api/initials/"+ y.name +".svg")));
    }
    
    return chats;
  }

  cmp = (a: any, b: any)=>{
    if(a.date==b.date){    
      return (a.time<b.time? -1:1);
    }
    return (a.date<b.date? -1:1);
  }
}

// look into the sorting of messages as day month year