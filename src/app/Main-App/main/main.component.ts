import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  @ViewChild('menu_btn') menuBtn!: ElementRef;

  flip = 0;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {    
    this.router.navigate(['home'], {relativeTo: this.activatedRoute});
  }

  showMenu(){
    this.flip^=1;

    if(this.flip) {
      this.menuBtn.nativeElement.style.display = "inline";
    }
    else{
      this.menuBtn.nativeElement.style.display = "none";
    }

  }

}
