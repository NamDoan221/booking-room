import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { IParamsGetListProduct, IProduct } from './interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends BaseService {

  constructor() {
    super();
  }

  public getListProduct(params: IParamsGetListProduct): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get(`admin/product`, new HttpParams({ fromObject: { ...params } })).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public createProduct(body: IProduct): Promise<any> {
    const formData = new FormData();

    Object.keys(body).forEach(item => {
      formData.append(item, (body as any)[item]);
    })
    return new Promise((resolve, reject) => {
      this.postFormData(`admin/product`, formData).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public updateProduct(body: IProduct, id: string): Promise<any> {
    const formData = new FormData();

    Object.keys(body).forEach(item => {
      formData.append(item, (body as any)[item]);
    })
    return new Promise((resolve, reject) => {
      this.postFormData(`admin/product/${id}`, formData).subscribe({
        next: result => {
          resolve(result);
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

  public deleteProduct(ids_product: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.post(`admin/product`, { ids_product }).subscribe({
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
