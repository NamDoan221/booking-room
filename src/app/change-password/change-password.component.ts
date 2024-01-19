import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { AuthService } from '../shared/services/auth/auth.service';
import { IChangePassWord } from '../shared/services/auth/interfaces/auth.interfaces';

@Component({
  selector: 'bm-change-password',
  templateUrl: './change-password.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PmIconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzDatePickerModule,
    NzRadioModule
  ]
})
export class PmChangePasswordComponent {
  public signUpForm: FormGroup;
  public passwordVisible: boolean;
  public passwordRetypeVisible: boolean;
  public loading: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private nzMessageService: NzMessageService,
    private fb: FormBuilder,
  ) {
    this.loading = false;
    this.passwordVisible = false;
    this.passwordRetypeVisible = false;
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_verify: ['', [Validators.required, this.confirmationValidator.bind(this)]],
      code: ['', [Validators.required]],
    });
  }

  handlerBack() {
    this.router.navigate(['/login']);
  }

  async handlerChangePassword(): Promise<any> {
    if (!this.signUpForm.valid) {
      Object.values(this.signUpForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    try {
      const user: IChangePassWord = this.signUpForm.value;
      const result = await this.auth.changePassword(user);
      if (!result.success) {
        this.nzMessageService.error(result.message ?? 'Đổi mật khẩu thất bại! Vui lòng kiểm tra lại thông tin.');
        return;
      }
      this.nzMessageService.success('Đổi mật khẩu thành công!');
      this.router.navigate(['/login']);
    } catch (error) {
      this.nzMessageService.error('Đổi mật khẩu thất bại! Vui lòng kiểm tra lại thông tin.');
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  confirmationValidator(control: FormControl) {
    if (!control.value) {
      return { required: true };
    }
    if (control.value !== this.signUpForm.controls.password.value) {
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

}
