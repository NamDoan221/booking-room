export interface IParamsGetListRole {
  idPosition?: string;
  search: string;
  active?: boolean;
}

export interface IRole {
  key: string;
  name: string;
}

export interface IRoleChild extends IRole {
  IdParent?: string;
  ParentCode?: string;
  ParentName?: string;
}

export interface IBodyUpdateRole {
  IdPosition: string;
  IdFunction: string;
  Active: boolean;
}