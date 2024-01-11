import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { AuthService } from '../shared/services/auth/auth.service';
import { IBodyAddAccount } from '../shared/services/auth/interfaces/auth.interfaces';

@Component({
  selector: 'bm-sign_up',
  templateUrl: './sign-up.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PmIconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule
  ]
})
export class PmSignUpComponent {
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
      fullname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^(0|84)([0-9]{9})$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      verify_password: ['', [Validators.required, this.confirmationValidator.bind(this)]]
    });
  }

  handlerLogin() {
    this.router.navigate(['/login']);
  }

  async handlerSignUp(): Promise<any> {
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
      const user: IBodyAddAccount = this.signUpForm.value;
      delete user.verify_password;
      user.role = 'client';
      const result = await this.auth.addAccount(user);
      if (!result.success) {
        this.nzMessageService.error(result.message ?? 'Tạo tài khoản thất bại! Vui lòng kiểm tra lại thông tin.');
        return;
      }
      this.nzMessageService.success('Tạo tài khoản thành công!');
      this.router.navigate(['/login']);
    } catch (error) {
      this.nzMessageService.error('Tạo tài khoản thất bại! Vui lòng kiểm tra lại thông tin.');
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
