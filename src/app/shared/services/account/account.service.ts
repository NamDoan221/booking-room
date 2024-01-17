import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBodyAddAccount } from '../auth/interfaces/auth.interfaces';
import { BaseService } from '../base.service';
import { IBodyCheckIn, IParamsGetListAccount } from './interfaces/account.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends BaseService {

  constructor() {
    super();
  }

  public getListAccount(params: IParamsGetListAccount): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/account`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListAccountNotTeam(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/account/not-team`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListAccountNotClient(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/account/not-client`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public checkDayCheckedIn(time: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/day/status-check-in`, new HttpParams({ fromObject: { time } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public checkIn(body: IBodyCheckIn): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/account/check-in`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getAccountCheckInOfDay(time: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/account/day/check-in`, new HttpParams({ fromObject: { time } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getWage(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/account/${id}/get_wage`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getAccountById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/account/${id}`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createAccount(body: IBodyAddAccount): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/account`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateAccount(body: IBodyAddAccount, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.patch(`admin/account/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteAccount(ids: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/account/delete`, { ids_account: ids }).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getAccountByIds(ids: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/team/account`, { accounts: ids }).subscribe({
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
