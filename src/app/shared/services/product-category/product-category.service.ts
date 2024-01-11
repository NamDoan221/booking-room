import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IParamsGetListProductCategory, IProductCategory } from './interfaces/product-category.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService extends BaseService {

  constructor() {
    super();
  }

  public getListProductCategory(params: IParamsGetListProductCategory): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/category`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public getListStatusProductCategory(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/category/status`).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createProductCategory(body: IProductCategory): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/category`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateProductCategory(body: IProductCategory, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.patch(`admin/category/${id}`, body).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteProductCategory(ids_category: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/category`, { ids_category }).subscribe({
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
