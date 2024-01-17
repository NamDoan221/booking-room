import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmLibCardComponent } from './card.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PmLibCardComponent],
  exports: [PmLibCardComponent]
})
export class PmLibCardModule { }
