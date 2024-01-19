export interface ISalaryConfig {
  account: {
    email: string;
    fullname: string;
    id: string;
    phone: string;
  };
  account_id: string;
  wage: number;
}

export interface IParamsGetListSalary {
  page: number;
  per_page: number;
}

export interface IBodySalaryConfig {
  account_id: string;
  wage: number;
}

export interface IBodyUpdateSalaryConfig {
  wage: number;
}