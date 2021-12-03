import { RecentChatExtractorService } from './../../service-classes/recent-chat-extractor.service';
import { Location } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  recentChats: any[] = [];

  name = '';
  uid = '';

  image = '';

  wait: boolean = true;
  clear: any;

  @ViewChild('cover', { static: false })
  cover!: ElementRef;

  @ViewChild('Message', { static: false })
  messageInput!: ElementRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private recentChat: RecentChatExtractorService
  ) {}
  ngOnDestroy(): void {
    this.recentChat.allMessagesSse.close();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((data) => {
      this.name = data.friend;
      this.uid = data.uid;
      this.image = `https://avatars.dicebear.com/api/initials/${this.name}.svg`;

      this.recentChats = [];
      this.recentChat._extractAll(this.uid);
    });

    this.recentChat.allMessagesSubject.subscribe((data: any) => {
      if (data.auth_revoked) {
        this.recentChat.allMessagesSse.close();
        this.recentChat._extractAll(this.uid);
      } else this.extractMessages(data);
    });
  }

  goBack() {
    this.location.back();
  }

  extractMessages(_data: any) {
    if (_data.put !== null) {
      if (_data.put.path == '/') {
        let data = _data.put.data.messages;

        for (const key in data) {
          let n = this.recentChats.length;

          if (n) {
            if (
              this.recentChats[n - 1].date == data[key].date &&
              this.recentChats[n - 1].time == data[key].time
            ) {
            } else {
              this.recentChats.push(data[key]);
              this.recentChat.updateReadMessage(key, this.uid, data[key]);
            }
          } else {
            this.recentChats.push(data[key]);
          }
        }

        if (this.recentChats.length)
          this.recentChat.updateLast(
            this.uid,
            this.recentChats[this.recentChats.length - 1]
          );

        this.wait = false;
      }
    } else {
      let data = _data.patch.data;

      if (data.type == 'receive') {
        this.recentChats.push(data);
      }
    }

    setTimeout(() => {
      this.cover.nativeElement.scrollTop =
        this.cover.nativeElement.scrollHeight;
    }, 1);
  }

  send() {
    let message = this.messageInput.nativeElement.value;
    this.messageInput.nativeElement.value = '';

    if (message == '') {
      return;
    }

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    let date = dd + '-' + mm + '-' + yyyy;
    let time = new Date().toTimeString().slice(0, 8);

    let messageObjectSend = {
      date: date,
      time: time,
      read: 1,
      message: message,
      type: 'send',
    };

    this.recentChats.push(messageObjectSend);

    this.recentChat.lastMessagesSubject.next({
      patch: { data: messageObjectSend, path: `/${this.uid}` },
    });

    setTimeout(() => {
      this.cover.nativeElement.scrollTop =
        this.cover.nativeElement.scrollHeight;
    }, 1);

    this.recentChat.sendMessage(message, this.uid).subscribe((data: any) => {});
  }
}
