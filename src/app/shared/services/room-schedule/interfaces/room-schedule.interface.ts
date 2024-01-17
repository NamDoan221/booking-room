import { IAccount } from "../../account/interfaces/account.interface";
import { IProductCategory } from "../../product-category/interfaces/product-category.interface";
import { IProduct } from "../../product/interfaces/product.interface";

export interface IBodyRoomSchedulePreOrder {
  start: string;
  end: string;
  id_product: string;
  id_account: string;
}

export interface IBodyCheckOutRoom {
  total_price: number
}

export interface IBodyGetPrice {
  time: string;
  id_order: string;
  id_product: string;
  id_account: string;
  product?: Array<{
    id_product: string;
    number: number;
  }>;
}

export interface IRoomSchedule {
  create_on: string;
  id: string;
  id_account: string;
  id_product: string;
  info_account: IAccount;
  status: string;
  time_check_in: string;
  time_check_out: string;
  info_product: IProduct;
  info_category: IProductCategory;
  total_price: number;
}

export interface IParamsGetListRoomSchedule {
  page: number;
  per_page: number;
  start?: string;
  end?: string;
  status?: string;
  name?: string;
}