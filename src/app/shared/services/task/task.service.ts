import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IBodyAddTask, ITask } from './interfaces/task.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService extends BaseService {

  constructor() {
    super();
  }

  public getListTask(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/work`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListUserTask(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/work-user`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createTask(body: IBodyAddTask): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/work`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateTask(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.patch(`admin/work/${id}`, undefined).subscribe({
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
