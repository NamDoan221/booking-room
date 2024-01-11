import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IBodyAddTeam, IParamsGetListTeam } from './interfaces/team.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TeamService extends BaseService {

  constructor() {
    super();
  }

  public getListTeam(params: IParamsGetListTeam): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/team`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getTeamById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/team/${id}`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createTeam(body: IBodyAddTeam): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/team`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateTeam(body: IBodyAddTeam, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.patch(`admin/team/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteTeam(ids: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/team`, { ids_team: ids }).subscribe({
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
