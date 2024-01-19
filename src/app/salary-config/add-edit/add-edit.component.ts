import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { AccountService } from '../../shared/services/account/account.service';
import { IAccount } from '../../shared/services/account/interfaces/account.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { IBodySalaryConfig, ISalaryConfig } from '../../shared/services/salary-config/interfaces/salary-config.interface';
import { SalaryConfigService } from '../../shared/services/salary-config/salary-config.service';

@Component({
  selector: 'pm-salary-config-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NzSelectModule,
    FormsModule,
    ReactiveFormsModule,
    PmIconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzSelectModule,
    NzSpinModule
  ]
})
export class PmSalaryConfigAddEditComponent implements OnInit {

  salaryConfigForm!: FormGroup;
  loading?: boolean;
  listAccount: Array<IAccount>;

  @Input() listSalaryConfig?: ISalaryConfig[];
  @Input() salaryConfig?: ISalaryConfig;
  @Input() modeEdit?: boolean;

  @Output() saveSuccess = new EventEmitter<ISalaryConfig>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private salaryConfigService: SalaryConfigService
  ) {
    this.listAccount = [];
  }

  ngOnInit(): void {
    this.salaryConfigForm = this.fb.group({
      account_id: [this.salaryConfig?.account_id ?? '', [Validators.required]],
      wage: [this.salaryConfig?.wage ?? '', [Validators.required]]
    });
    this.getListAccount();
  }

  async getListAccount() {
    try {
      const result = await this.accountService.getListAccountNotClient();
      this.listAccount = result.data;
      if (!this.modeEdit) {
        this.listAccount = this.listAccount.filter(item => !this.listSalaryConfig?.find(element => element.account_id === item.id));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    // if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
    //   return;
    // }
    if (!this.salaryConfigForm.valid) {
      Object.values(this.salaryConfigForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body: IBodySalaryConfig = this.salaryConfigForm.value
    try {
      const result = await (this.modeEdit ? this.salaryConfigService.updateSalary(body) : this.salaryConfigService.configSalary(body));
      if (result.code === 200) {
        this.saveSuccess.emit({
          ...result.data,
          account: {
            fullname: result.data.fullname,
            email: result.data.email
          }
        });
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

}
