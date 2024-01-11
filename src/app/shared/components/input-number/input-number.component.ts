import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'bm-components-input-number',
  templateUrl: './input-number.component.html',
  standalone: true,
  imports: [
    NzInputModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PmComponentsInputNumberComponent {

  @Input() item!: any;
  @Input() maxValue: number;
  @Input() field!: string;

  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef;

  constructor() {
    this.maxValue = 12
  }

  onChange(value: string): void {
    this.updateValue(value);
  }

  onBlur(): void {
    if (this.item[this.field].charAt(this.item[this.field].length - 1) === '.' || this.item[this.field] === '-') {
      this.updateValue(this.item[this.field].slice(0, -1));
    }
  }

  updateValue(value: string): void {
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(+value) && reg.test(value)) || value === '' || value === '-') {
      this.item[this.field] = value;
    }
    if (this.item[this.field] && +this.item[this.field] > this.maxValue) {
      this.item[this.field] = this.maxValue;
    }
    if (this.item[this.field] && +this.item[this.field] < 1) {
      this.item[this.field] = 1;
    }
    this.inputElement!.nativeElement.value = this.item[this.field];
  }

}
