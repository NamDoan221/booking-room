export interface IParamsGetListProductCategory {
  page: number;
  per_page: number;
  name?: string;
  status?: boolean;
}

export interface IProductCategory {
  id: string;
  name: string;
  describe?: string;
  status: string;
}

export interface IStatusProductCategory {
  key: string;
  name: string;
}