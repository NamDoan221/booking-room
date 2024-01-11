export interface ITeam {
  accounts: Array<IAccountInTeam>;
  id: string;
  name: string;
}

export interface IAccountInTeam {
  email: string;
  fullname: string;
  id: string;
  phone: string;
  position: 'leader' | 'member';
}

export interface IParamsGetListTeam {
  page: number;
  per_page: number;
  search?: string;
}

export interface IBodyAddTeam {
  name: string;
  accounts: Array<IBodyAccountInTeam>;
}

export interface IBodyAccountInTeam {
  id_account: string;
  position: 'leader' | 'member';
}