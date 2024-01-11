import { CurrencyPipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { AccountService } from '../../shared/services/account/account.service';
import { IAccount } from '../../shared/services/account/interfaces/account.interface';
import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  selector: 'pm-check-in-get-wage',
  templateUrl: './get-wage.component.html',
  styleUrls: ['./get-wage.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass,
    FormsModule,
    PmIconsProviderModule,
    NzSpinModule,
    NzSelectModule,
    DecimalPipe
  ]
})
export class PmCheckInGetWageComponent implements OnInit {

  protected wageData?: {
    wage: number;
    time_month: number;
  }
  protected selectedAccount?: string;
  protected loading?: boolean;
  protected listAccount: IAccount[];

  constructor(
    private accountService: AccountService,
    private nzMessageService: NzMessageService,
    private authService: AuthService
  ) {
    this.listAccount = [];
  }

  ngOnInit(): void {
    this.getListAccountNotClient();
  }

  async getListAccountNotClient() {
    try {
      const result = await this.accountService.getListAccountNotClient();
      this.listAccount.push(...result.data);
    } catch (error) {
      console.log(error);
    }
  }

  async handlerSelectedAccount(event: string) {
    this.wageData = undefined;
    try {
      this.loading = true;
      const result = await this.accountService.getWage(event);

      this.wageData = result.data;
    } catch (error) {
      console.log(error);
      this.nzMessageService.error('Có lỗi phát sinh, vui lòng thử lại');
    } finally {
      this.loading = false;
    }
  }

}
