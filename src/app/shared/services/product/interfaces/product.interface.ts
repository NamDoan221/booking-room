export interface IParamsGetListProduct {
  page: number;
  per_page: number;
  name?: string;
  ids_category?: string;
}

export interface IProduct {
  id: string;
  name: string;
  image?: string;
  price: string;
  id_category: string;
  account_id?: string;
}