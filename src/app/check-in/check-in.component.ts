import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, inject } from '@angular/core';
import dayjs from 'dayjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { NzDrawerModule, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { AccountService } from '../shared/services/account/account.service';
import { AuthService } from '../shared/services/auth/auth.service';
import { PmCheckInGetWageComponent } from './get-wage/get-wage.component';
import { CheckDayCheckedInPipe } from './pipes/check-day-checked-in.pipe';
import { PmCheckInUpdateComponent } from './update/update.component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { UpdateDayCheckedInPipe } from './pipes/update-day-checked-in.pipe';
import { uniqBy } from 'lodash';
import { ConstantDefines } from '../shared/defines/constant.define';
import { CacheService } from '../shared/services/cache.service';

@Component({
  selector: 'bm-check-in',
  templateUrl: './check-in.component.html',
  standalone: true,
  imports: [
    NgIf, NgFor, NgSwitch, NgSwitchCase, AsyncPipe,
    NzButtonModule,
    PmIconsProviderModule,
    NzDrawerModule,
    NzNotificationModule,
    NzCalendarModule,
    CheckDayCheckedInPipe,
    NzToolTipModule,
    UpdateDayCheckedInPipe
  ]
})
export class PmCheckInComponent {

  protected dayCheckedIn: Array<string>;

  private isOpenDrawAddEdit?: boolean;
  private drawerRefGlobal?: NzDrawerRef;
  private cacheService = inject(CacheService);

  constructor(
    private drawerService: NzDrawerService,
    private nzMessageService: NzMessageService,
    private accountService: AccountService,
    private authService: AuthService
  ) {
    this.dayCheckedIn = [];
  }

  selectChange(select: Date): void {
    this.checkIn(select);
  }

  handlerGetWage(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/personnel', 'ADD_PERSONNEL')) {
    //   return;
    // }
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmCheckInGetWageComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: 'Tính lương',
      nzContent: PmCheckInGetWageComponent,
    });

    this.drawerRefGlobal.afterClose.subscribe(() => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal?.close();
    });
  }

  checkIn(selectDate: Date) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    const time = dayjs(selectDate).format('DD/MM/YYYY');
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmCheckInUpdateComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '40vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: `Chấm công - ${time}`,
      nzContent: PmCheckInUpdateComponent,
      nzContentParams: {
        selectDate: selectDate,
        modeEdit: dayjs().diff(dayjs(selectDate), 'day') <= 0
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal?.getContentComponent().saveSuccess.subscribe(() => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal?.close();
        this.dayCheckedIn = uniqBy([...this.dayCheckedIn, time], item => item);
        const dataCache = this.cacheService.getKey(ConstantDefines.CHECKED_IN_KEY);

        if (dataCache) {
          const dataCacheParse = JSON.parse(dataCache);

          this.cacheService.setKey(ConstantDefines.CHECKED_IN_KEY, JSON.stringify(dataCacheParse.filter((item: any) => item.time !== time)));
        }
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(() => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal?.close();
    });
  }

}
