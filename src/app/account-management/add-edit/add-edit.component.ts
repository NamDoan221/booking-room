import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AccountService } from '../../shared/services/account/account.service';
import { IAccount } from '../../shared/services/account/interfaces/account.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { get } from 'lodash';
import { NgFor, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { IRole } from '../../shared/services/role/interfaces/role.interface';
import { RoleService } from '../../shared/services/role/role.service';

@Component({
  selector: 'pm-account-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor,
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
export class PmAccountAddEditComponent implements OnInit {

  accountForm!: FormGroup;
  loading?: boolean;
  passwordVisible?: boolean;
  passwordRetypeVisible?: boolean;
  listRole: Array<IRole>;

  @Input() account?: IAccount;
  @Input() modeEdit?: boolean;

  @Output() saveSuccess = new EventEmitter<IAccount>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private roleService: RoleService
  ) {
    this.listRole = [];
  }

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      username: [this.account?.username ?? '', [Validators.required]],
      fullname: [this.account?.fullname ?? '', [Validators.required]],
      email: [this.account?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.account?.phone ?? '', [Validators.required, Validators.pattern('^(0|84)([0-9]{9})$')]],
      password: [this.account?.password ?? '', this.account ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]],
      role: [this.account?.role ?? '', [Validators.required]],
      verify_password: ['', this.account ? [this.confirmationValidator.bind(this)] : [Validators.required, this.confirmationValidator.bind(this)]]
    });
    this.getListRole();
  }

  async getListRole() {
    try {
      const result = await this.roleService.getListRole();
      this.listRole.push(...result.data);
    } catch (error) {
      console.log(error);
    }
  }

  confirmationValidator(control: FormControl) {
    if (!this.account && !control.value) {
      return { required: true };
    }
    if (control.value !== this.accountForm?.controls.password.value) {
      return { confirm: true, error: true };
    }
    return {};
  }

  handlerChangeViewPassword(type: string): void {
    if (type === 'password') {
      this.passwordVisible = !this.passwordVisible;
      return;
    }
    this.passwordRetypeVisible = !this.passwordRetypeVisible;
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    // if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
    //   return;
    // }
    if (!this.accountForm.valid) {
      Object.values(this.accountForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.accountForm.value
    }
    try {
      const result = await (this.modeEdit ? this.accountService.updateAccount(body, this.account?.id || '') : this.accountService.createAccount(body));
      if (result.code === 200) {
        this.saveSuccess.emit(body);
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
