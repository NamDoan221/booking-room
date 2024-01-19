import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IBodySalaryConfig, IBodyUpdateSalaryConfig, IParamsGetListSalary } from './interfaces/salary-config.interface';

@Injectable({
  providedIn: 'root',
})
export class SalaryConfigService extends BaseService {

  constructor() {
    super();
  }

  public getListSalary(params: IParamsGetListSalary): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/wage`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public configSalary(body: IBodySalaryConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/wage`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateSalary(body: IBodySalaryConfig): Promise<any> {
    const id = body.account_id;
    return new Promise((resolve, reject) => {
      this.patch(`admin/wage/${id}`, { wage: body.wage }).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteSalaryConfig(ids: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/wage`, { account_ids: ids }).subscribe({
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
