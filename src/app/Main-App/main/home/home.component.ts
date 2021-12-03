import { ChatComponent } from './chat/chat.component';
import { RecentChatModel } from './../helper-classes/recent-chat-model';
import { CookieService } from 'ngx-cookie-service';
import { RecentChatExtractorService } from './../service-classes/recent-chat-extractor.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('remove700') remove700!: ElementRef;
  @ViewChild('add700') add700!: ElementRef;
  @ViewChild('recent') recent!: ElementRef;

  recentChats: any[] = [];

  wait: boolean = true;

  ChatClicked: boolean = false;

  constructor(
    private recentChat: RecentChatExtractorService,
    private cookie: CookieService
  ) {}
  ngOnDestroy(): void {
    this.recentChat.sse.close();
  }

  ngOnInit(): void {
    this.recentChat._extract();

    this.recentChat.lastMessagesSubject.subscribe((data: any) => {
      if (data.patch) {
        let friendUid = data.patch.path.split('/')[1];
        let flag = 1;
        for (const chat of this.recentChats) {
          if (chat.uid == friendUid) {
            for (const key in data.patch.data) {
              chat[key] = data.patch.data[key];
              flag = 0;
            }
            break;
          }
        }

        if (flag) {
          this.extractNames(data.patch).then((data: any) => {
            this.recentChats.push(...data);
            this.recentChats.sort(this.cmp);
          });
        }
        this.recentChats.sort(this.cmp);
      } else if (data.put) {
        this.extractNames(data.put).then((data: any) => {
          this.recentChats.push(...data);

          this.wait = false;
        });
      } else {
        this.recentChat.sse.close();
        this.recentChats = [];
        this.recentChat._extract();
      }
    });
  }

  async extractNames(_data: any) {
    let chats: any[] = [];
    let id = this.cookie.get('id-chat').split(',');

    let data = _data.data;

    if (_data.path == '/') {
      for (const key in data) {
        let x: any = await fetch(
          `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${key}/username.json?auth=${id[0]}`,
          {
            method: 'GET',
          }
        );
        //
        let y = await x.json();

        chats.push(
          new RecentChatModel(
            y.name,
            key,
            data[key].date,
            data[key].time,
            data[key].message,
            data[key].read,
            data[key].type,
            'https://avatars.dicebear.com/api/initials/' + y.name + '.svg'
          )
        );
      }

      chats.sort(this.cmp);
    } else {
      let friendUid = _data.path.split('/')[1];

      let x: any = await fetch(
        `https://chat-4dbb2-default-rtdb.firebaseio.com/users/${friendUid}/username.json?auth=${id[0]}`,
        {
          method: 'GET',
        }
      );

      let y = await x.json();
      //
      chats.push(
        new RecentChatModel(
          y.name,
          friendUid,
          data.date,
          data.time,
          data.message,
          data.read,
          data.type,
          'https://avatars.dicebear.com/api/initials/' + y.name + '.svg'
        )
      );
    }

    return chats;
  }

  cmp = (a: any, b: any) => {
    let lhsD = a.date.split('-');
    let rhsD = b.date.split('-');
    let lhsT = a.date.split(':');
    let rhsT = b.date.split(':');

    let results = lhsD[2] < rhsD[2] ? 1 : lhsD[2] > rhsD[2] ? -1 : 0;

    if (results === 0)
      results = lhsD[1] < rhsD[1] ? 1 : lhsD[1] > rhsD[1] ? -1 : 0;

    if (results === 0)
      results = lhsD[0] < rhsD[0] ? 1 : lhsD[0] > rhsD[0] ? -1 : 0;

    if (results === 0)
      results = lhsT[0] < rhsT[0] ? 1 : lhsT[0] > rhsT[0] ? -1 : 0;

    if (results === 0)
      results = lhsT[1] < rhsT[1] ? 1 : lhsT[1] > rhsT[1] ? -1 : 0;

    if (results === 0)
      results = lhsT[0] < rhsT[0] ? 1 : lhsT[0] > rhsT[0] ? -1 : 0;

    return results;
  };

  chatDestroyed(event: any) {
    this.container.nativeElement.classList.toggle('container');
    this.recent.nativeElement.classList.add('expand');
    if (this.recent.nativeElement.classList.value.indexOf('shrink') != -1)
      this.recent.nativeElement.classList.remove('shrink');

    this.remove700.nativeElement.style.display = 'block';
    this.add700.nativeElement.style.display = 'none';

    if (window.innerWidth <= 700)
      this.recent.nativeElement.children[0].style.width = '80vw';
  }

  chatInit(event: any) {
    this.container.nativeElement.classList.toggle('container');

    this.recent.nativeElement.classList.add('shrink');
    if (this.recent.nativeElement.classList.value.indexOf('expand') != -1)
      this.recent.nativeElement.classList.remove('expand');

    if (window.innerWidth <= 700) {
      this.remove700.nativeElement.style.display = 'none';
      this.add700.nativeElement.style.display = 'block';
      this.recent.nativeElement.children[0].style.width = '20vw';
    }
  }
}

// look into the sorting of messages as day month year
