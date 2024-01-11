export interface IParamsGetListAccount {
  page: number;
  per_page: number;
  name?: string;
  role?: 'admin' | 'user' | 'client';
  status?: 'onl' | 'of';
}

export interface IAccount {
  id: string;
  fullname: string;
  phone: string;
  email: string;
  role: 'admin' | 'user' | 'client';
  username: string;
  password: string;
}

export interface IBodyCheckIn {
  time: string;
  accounts: Array<{
    account_id: string;
    time_work: number;
  }>;
}