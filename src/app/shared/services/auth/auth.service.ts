import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConstantDefines } from '../../defines/constant.define';
import { BaseService } from '../base.service';
import { IBodyAddAccount, IBodyChangeInfo, IBodyForgetPassword, IBodyLogin, IChangePassWord, IParamsConnectGoogle, IToken } from './interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {

  constructor(
    private nzMessageService: NzMessageService
  ) {
    super();
  }

  public decodeToken(): IToken | undefined {
    const token = this.cacheService.getKey(ConstantDefines.TOKEN_KEY);
    if (!token) {
      this.redirectToLogin();
      return undefined;
    }
    return JSON.parse(token);
  }

  public setToken(token: string) {
    this.cacheService.setKey(ConstantDefines.TOKEN_KEY, token);
  }

  public getAccount(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(`Account/${id}`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public login(body: IBodyLogin): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/login`, body).subscribe({
        next: result => {
          if (result.code !== 200) {
            return reject();
          }
          this.setToken(JSON.stringify(result.token));
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public connectGoogle(params: IParamsConnectGoogle): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`Auth/authenticate-gg`, undefined, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public logout(): Promise<any> {
    const token = this.decodeToken()?.RefreshToken;
    return new Promise((resolve, reject) => {
      this.post(`Account/revoke-token`, { Token: token }).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public addAccount(body: IBodyAddAccount): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/account/client`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public checkExistAccount(body: { phone: string, email: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`Auth/check-exist-account`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeAvatar(id: string, url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`Account/${id}/change-avatar`, undefined, new HttpParams({ fromObject: { url: url } })).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public changePassword(body: IChangePassWord): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`admin/forget/change-password`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public forgetPassword(body: IBodyForgetPassword) {
    return new Promise((resolve, reject) => {
      this.post(`admin/forget-password`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public changeInfo(body: IBodyChangeInfo, idAccount: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`Account/${idAccount}`, body).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public disconnectGoogle(idAccount: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.put(`Account/${idAccount}/disconnect-google`, undefined).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  public verifyToken(): boolean {
    const token = this.cacheService.getKey(ConstantDefines.TOKEN_KEY);
    if (!token) {
      this.redirectToLogin();
      return false;
    }
    const tokenTemp = jwtDecode<{ id?: string }>(JSON.parse(token));
    if (!tokenTemp || !tokenTemp.id) {
      this.cacheService.clearAll();
      this.redirectToLogin();
      return false;
    }
    return true;
  }

  public refreshToken(body: { refreshToken: string }) {
    return this.post(`Auth/refresh-tokens`, body)
  }

  public checkPermission(path: string, action?: string) {
    // const roles = this.decodeToken()?.Roles;
    // const findRoleByPath = roles?.find(role => role.Url === path);
    // if (!findRoleByPath) {
    //   this.nzMessageService.error('Bạn không có quyền truy cập chức năng này.');
    //   if (roles?.length) {
    //     this.router.navigateByUrl(roles[0].Url || '');
    //     return false;
    //   }
    //   return false;
    // }
    // if (action) {
    //   const childFound = findRoleByPath.RoleChilds?.find(child => child.FunctionCode === action);
    //   if (childFound && childFound.Active) {
    //     return true;
    //   }
    //   this.nzMessageService.error('Bạn không có quyền truy cập chức năng này.');
    //   return false;
    // }
    // return true;
  }
}

@Injectable()
export class UserCanActive {

  constructor(private auth: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.verifyToken()) {
      return false;
    }
    // if (!this.auth.checkPermission(state.url.split('?')[0])) {
    //   return false;
    // }
    return true;
  }
}
