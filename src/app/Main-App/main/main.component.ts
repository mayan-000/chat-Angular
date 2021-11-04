import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  @ViewChild('menu_btn') menuBtn!: ElementRef;
  @ViewChild('bars') bars!: ElementRef;
  @ViewChild('cross') cross!: ElementRef;


  flip = 0;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {    
    this.router.navigate(['home'], {relativeTo: this.activatedRoute});
  }

  showMenu(){
    this.flip^=1;    
    
    if(this.flip){
      this.menuBtn.nativeElement.classList.toggle('move-in');

      if(this.bars.nativeElement.classList.value.indexOf('in')!=-1){
        this.bars.nativeElement.classList.toggle('in');
      }

      this.bars.nativeElement.classList.toggle('out');

      if(this.cross.nativeElement.classList.value.indexOf('out')!=-1){
        this.cross.nativeElement.classList.toggle('out');
      }

      this.cross.nativeElement.classList.toggle('in');

      if(this.menuBtn.nativeElement.classList.value.indexOf('move-out')!=-1){
        this.menuBtn.nativeElement.classList.toggle('move-out');
      }
    }
    else{
      this.menuBtn.nativeElement.classList.toggle('move-out');

      if(this.bars.nativeElement.classList.value.indexOf('out')!=-1){
        this.bars.nativeElement.classList.toggle('out');
      }      

      this.bars.nativeElement.classList.toggle('in');

      if(this.cross.nativeElement.classList.value.indexOf('in')!=-1){
        this.cross.nativeElement.classList.toggle('in');
      }

      this.cross.nativeElement.classList.toggle('out');


      if(this.menuBtn.nativeElement.classList.value.indexOf('move-in')!=-1){
        this.menuBtn.nativeElement.classList.toggle('move-in');
      }
    }

  }

}
