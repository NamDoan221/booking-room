import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import dayjs from 'dayjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { PmComponentsInputNumberComponent } from '../../shared/components/input-number/input-number.component';
import { AccountService } from '../../shared/services/account/account.service';
import { IAccount, IBodyCheckIn } from '../../shared/services/account/interfaces/account.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { CheckedInPipe } from '../pipes/checked-in-pipe';

@Component({
  selector: 'pm-check-in-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass,
    FormsModule,
    ReactiveFormsModule,
    PmIconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzSpinModule,
    NzCheckboxModule,
    CheckedInPipe,
    PmComponentsInputNumberComponent
  ]
})
export class PmCheckInUpdateComponent implements OnInit {

  protected loading?: boolean;
  protected listAccount: IAccount[];
  protected accountCheckedIn: Array<{ account_id: string, time_work: string }>;
  protected disable?: boolean;

  @Input() modeEdit?: boolean;
  @Input() selectDate?: Date;

  @Output() saveSuccess = new EventEmitter<void>();

  constructor(
    private accountService: AccountService,
    private nzMessageService: NzMessageService,
    private authService: AuthService
  ) {
    this.listAccount = [];
    this.accountCheckedIn = [];
  }

  ngOnInit(): void {
    this.getListAccountNotClient();
    if (this.selectDate) {
      this.getAccountCheckInOfDay();
    }
  }

  async getListAccountNotClient() {
    try {
      const result = await this.accountService.getListAccountNotClient();
      this.listAccount.push(...result.data);
    } catch (error) {
      console.log(error);
    }
  }

  async getAccountCheckInOfDay() {
    try {
      const dataTime = dayjs(this.selectDate).format('DD/MM/YYYY');
      const result = await this.accountService.getAccountCheckInOfDay(dataTime);

      this.accountCheckedIn = result.data.map((item: { id: string; time_work: number; }) => {
        return {
          account_id: item.id,
          time_work: item.time_work
        }
      });
      this.disable = true;
    } catch (error) {
      console.log(error);
    }
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    // if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
    //   return;
    // }
    this.loading = true;
    const body: IBodyCheckIn = {
      time: dayjs(this.selectDate).format('DD/MM/YYYY'),
      accounts: this.accountCheckedIn.map(item => {
        return {
          account_id: item.account_id,
          time_work: +item.time_work
        }
      })
    }
    try {
      const result = await this.accountService.checkIn(body);
      if (result.code === 200) {
        this.saveSuccess.emit();
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }
  }

  handlerChangeCheckedIn(event: boolean, id: string) {
    console.log(id);

    if (!event) {
      this.accountCheckedIn = this.accountCheckedIn.filter(item => item.account_id !== id);
      return;
    }
    this.accountCheckedIn = [...this.accountCheckedIn, { account_id: id, time_work: '8' }];
  }

}
