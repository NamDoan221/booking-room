import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IBodyUpdateRole, IParamsGetListRole, IRole } from './interfaces/role.interface';

@Injectable({
  providedIn: 'root',
})
export class RoleService extends BaseService {

  constructor() {
    super();
  }

  public getListRole(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/roles`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateRole(body: IBodyUpdateRole): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`Role`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }
}
