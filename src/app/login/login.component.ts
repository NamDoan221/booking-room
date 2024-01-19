import { AuthService } from '../shared/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IBodyLogin } from '../shared/services/auth/interfaces/auth.interfaces';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CookieService } from 'ngx-cookie-service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';

@Component({
  selector: 'pm-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PmIconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzCheckboxModule
  ]
})
export class PmLoginComponent implements OnInit {

  loginForm: FormGroup;
  passwordVisible: boolean;
  loading: boolean;
  loadingGoogle: boolean;
  rememberAccount: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private nzMessageService: NzMessageService,
    private cookieService: CookieService
  ) {
    this.loading = false;
    this.loadingGoogle = false;
    this.passwordVisible = false;
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]]
    });
    this.rememberAccount = this.cookieService.get('RememberMe');
  }

  ngOnInit(): void {
    const url = window.location.href.replace(/(http:|https:)[/]+[^/]+/g, '').replace('/login', '');
    if (this.auth.verifyToken()) {
      this.router.navigateByUrl(url);
    }
  }

  async handlerLogin() {
    if (this.loading) {
      return;
    }
    if (!this.loginForm.valid) {
      for (const i in this.loginForm.controls) {
        this.loginForm.controls[i].markAsDirty();
        this.loginForm.controls[i].updateValueAndValidity();
      }
      return;
    }
    this.loading = true;
    try {
      const body: IBodyLogin = {
        username: this.loginForm.get('username') && this.loginForm.get('username')?.value || '',
        password: this.loginForm.get('password') && this.loginForm.get('password')?.value || ''
      }
      await this.auth.login(body);
      this.nzMessageService.success('Đăng nhập thành công!');
      const role = this.auth.decodeToken().role;
      this.router.navigate([role === 'admin' ? '/account-management' : '/task']);
    } catch (error) {
      this.nzMessageService.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin đăng nhập.');
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerForgetPassword() {
    this.router.navigate(['/forget-password']);
  }

  handlerUpdateRemember(event: boolean) {
    this.rememberAccount = `${event}`;
    if (event) {
      this.cookieService.set('RememberMe', 'true', { expires: 30, secure: true, sameSite: 'None' });
      return;
    }
    this.cookieService.delete('RememberMe');
  }

  handlerSignUp(): any {
    this.router.navigate(['/signup']);
  }

  onChangeViewPassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

}
