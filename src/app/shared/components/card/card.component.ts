import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pm-lib-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class PmLibCardComponent implements OnInit {
  @Input() labelTitle?: string;
  constructor() { }

  ngOnInit() {
  }

}
