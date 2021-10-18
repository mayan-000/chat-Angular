import { CookieService } from 'ngx-cookie-service';
import { RecentChatExtractorService } from './../../service-classes/recent-chat-extractor.service';
import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {

  recentChats: any[] = [];

  name = "";
  uid = "";

  image = "";

  wait: boolean = true;
  clear: any;

  @ViewChild("cover", { static: false })
  cover!: ElementRef;

  @ViewChild("Message", {static: false})
  messageInput!: ElementRef;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private location: Location, private recentChat: RecentChatExtractorService, private cookie: CookieService) { }
  ngOnDestroy(): void {
    clearInterval(this.clear);
  }

  ngAfterViewInit(): void {
    this.messageInput.nativeElement.addEventListener('keypress', (e: any)=>{
      if(e.key=="Enter"){
        this.send();        
      }
    });
  }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe((data)=>{
      this.name = data.friend;
      this.uid = data.uid;
      this.image = `https://avatars.dicebear.com/api/initials/${this.name}.svg`;
    });

    this.extractMessages();
  }

  
  goBack() {
    this.location.back();
  }

  extractMessages(){
    let f = 1;
    this.clear = setInterval(()=>{
      
      this.recentChat.extractAll()
      .subscribe((data: any)=>{

      let tempChats = [...this.recentChats];

      this.recentChats = [];

      let messages = data[this.uid].messages
      for (const mID in messages) {
        this.recentChats.push(messages[mID]);
        
        this.recentChat.updateReadMessage(mID, this.uid, messages[mID])
      }

      if(this.recentChats.length)
      this.recentChat.updateLast(this.uid, this.recentChats[this.recentChats.length-1])

      this.wait = false;

      if(this.recentChats.length != f)
      this.cover.nativeElement.scrollTop = this.cover.nativeElement.scrollHeight;

      f = tempChats.length;
    });
    },500);
  }

  send(){
    let message = this.messageInput.nativeElement.value;
      this.messageInput.nativeElement.value="";
      this.recentChat.sendMessage(message, this.uid).subscribe((data: any)=>{});
  }

}
