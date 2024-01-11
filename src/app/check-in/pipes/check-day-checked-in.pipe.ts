/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform, inject } from '@angular/core';
import { AccountService } from '../../shared/services/account/account.service';
import dayjs from 'dayjs';
import { CacheService } from '../../shared/services/cache.service';
import { ConstantDefines } from '../../shared/defines/constant.define';

@Pipe({ name: 'CheckDayCheckedInPipe', standalone: true })
export class CheckDayCheckedInPipe implements PipeTransform {

  private accountService = inject(AccountService);
  private cacheService = inject(CacheService);

  async transform(time: Date): Promise<boolean> {
    const dataTime = dayjs(time).format('DD/MM/YYYY');
    const dataCache = this.cacheService.getKey(`${ConstantDefines.CHECKED_IN_KEY}_${dataTime}`);

    if (dataCache) {
      const dataCacheParse = JSON.parse(dataCache);
      const dayFound = dataCacheParse.find((item: any) => item.time === dataTime);

      if (dayFound) {
        return dayFound.status === 'yes';
      }
    }
    try {
      const result = await this.accountService.checkDayCheckedIn(dayjs(time).format('DD/MM/YYYY'));
      const newData = [{
        time: dataTime,
        status: result.status
      }];

      this.cacheService.setKey(`${ConstantDefines.CHECKED_IN_KEY}_${dataTime}`, JSON.stringify(newData));

      return result.status === 'yes';
    } catch (error) {
      return false;
    }
  }
}
