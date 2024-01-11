/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'CheckedInPipe', standalone: true })
export class CheckedInPipe implements PipeTransform {
  transform(id: string, accountCheckedIn: Array<{ account_id: string, time_work: string }>, returnObject: boolean): any {
    if (returnObject) {
      return accountCheckedIn.find(item => item.account_id === id);
    }
    return accountCheckedIn.some(item => item.account_id === id);
  }
}
