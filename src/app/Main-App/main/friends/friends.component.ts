import { CookieService } from 'ngx-cookie-service';
import { filter, switchMap } from 'rxjs/operators';
import { FriendsExtractorService } from './../service-classes/friends-extractor.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent implements OnInit {
  friendsList: { name: string; uid: string }[] = [];
  requestsList: { name: string; uid: string }[] = [];
  suggestionsList: { name: string; uid: string }[] = [];
  tempList: any[] = [];

  wait = true;

  constructor(
    private friendsExtractor: FriendsExtractorService,
    private cookie: CookieService
  ) {}

  ngOnInit(): void {
    this.extract();
  }

  acceptRequest(request: { name: string; uid: string }) {
    this.requestsList.splice(this.requestsList.indexOf(request), 1);
    this.friendsList.push(request);
    this.friendsExtractor.acceptRequest(request);
  }

  addFriend(suggestion: { name: string; uid: string }) {
    this.suggestionsList.splice(this.suggestionsList.indexOf(suggestion), 1);
    this.friendsExtractor.addFriend(suggestion);
  }

  extract() {
    this.wait = true;
    this.friendsExtractor
      .extractFriends()
      .pipe(
        switchMap((data: Observable<any>) => {
          return data;
        }),
        switchMap((data: any) => {
          this.friendsList = data;

          return this.friendsExtractor.extractRequests();
        }),
        switchMap((data: Observable<any>) => {
          return data;
        }),
        switchMap((data: any) => {
          this.requestsList = data;

          return this.friendsExtractor.extractSuggestions();
        }),
        switchMap((data: Observable<any>) => {
          return data;
        }),
        switchMap((data: any) => {
          this.tempList = data;
          return this.friendsExtractor.lookup();
        })
      )
      .subscribe((data: any) => {
        let list: any[] = [];

        for (const i of this.tempList) {
          let cnt = 0;
          for (const j of this.friendsList) {
            if (i.name === j.name && i.uid === j.uid) {
              cnt = 1;
            }
          }

          for (const j of this.requestsList) {
            if (i.name === j.name && i.uid === j.uid) {
              cnt = 1;
            }
          }

          if (!cnt && i.uid != data.users[0].localId) {
            list.push(i);
          }
        }

        this.suggestionsList = list;
        this.wait = false;
      });
  }
}
