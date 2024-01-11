/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({ name: 'UpdateDayCheckedInPipe', standalone: true })
export class UpdateDayCheckedInPipe implements PipeTransform {

  transform(time: Date, dayCheckedIn: Array<string>): boolean {
    return dayCheckedIn.includes(dayjs(time).format('DD/MM/YYYY'));
  }
}
