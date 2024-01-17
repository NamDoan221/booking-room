import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IBodyCheckOutRoom, IBodyGetPrice, IBodyRoomSchedulePreOrder, IParamsGetListRoomSchedule } from './interfaces/room-schedule.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RoomScheduleService extends BaseService {

  constructor() {
    super();
  }

  public getListRoomSchedule(params: IParamsGetListRoomSchedule): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/order`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public preOrderRoomSchedule(body: IBodyRoomSchedulePreOrder): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/pre-order`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public checkInRoom(id_product: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.patch(`admin/check-in/${id_product}/room`, undefined).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public checkOutRoom(body: IBodyCheckOutRoom, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.patch(`/admin/check-out/${id}/room`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getPrice(body: IBodyGetPrice): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/check-out/get-price`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListRoom(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/product/vila`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getProduct(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/product/not-vila`).subscribe({
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
