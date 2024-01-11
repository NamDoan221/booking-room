import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { AuthService } from '../shared/services/auth/auth.service';
import { IBodyForgetPassword } from '../shared/services/auth/interfaces/auth.interfaces';

@Component({
  selector: 'pm-forget-password',
  templateUrl: './forget-password.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PmIconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzCheckboxModule
  ]
})
export class PmForgetPasswordComponent {

  forgetPasswordForm: FormGroup;
  passwordVisible: boolean;
  loading: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private nzMessageService: NzMessageService
  ) {
    this.loading = false;
    this.passwordVisible = false;
    this.forgetPasswordForm = this.fb.group({
      username: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]]
    });
  }

  async handlerForgetPassword() {
    if (this.loading) {
      return;
    }
    if (!this.forgetPasswordForm.valid) {
      for (const i in this.forgetPasswordForm.controls) {
        this.forgetPasswordForm.controls[i].markAsDirty();
        this.forgetPasswordForm.controls[i].updateValueAndValidity();
      }
      return;
    }
    this.loading = true;
    try {
      const body: IBodyForgetPassword = {
        username: this.forgetPasswordForm.get('username') && this.forgetPasswordForm.get('username')?.value || '',
        email: this.forgetPasswordForm.get('email') && this.forgetPasswordForm.get('email')?.value || ''
      }
      await this.auth.forgetPassword(body);
      this.nzMessageService.success('Vui lòng kiểm tra email và xác nhận thông tin.');
      this.router.navigate(['/change-password']);
    } catch (error) {
      this.nzMessageService.error('Vui lòng kiểm tra lại thông tin.');
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerBack() {
    this.router.navigate(['/login']);
  }

  onChangeViewPassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

}
