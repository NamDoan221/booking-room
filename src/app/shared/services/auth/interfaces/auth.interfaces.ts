import { IRole } from "../../role/interfaces/role.interface";

export interface IChangePassWord {
  username: string;
  password: string;
  password_verify: string;
}

export interface IToken {
  username?: string;
  fullname?: string;
  AvatarUrl?: string;
  email?: string;
  Gender?: number;
  Dob?: string;
  JwtToken?: string;
  RefreshToken?: string;
  CreateDate?: string;
  UpdateDate?: string;
  Active?: boolean;
  Phone?: string;
  Id?: string;
  PositionName?: string;
  DepartmentName?: string;
  Roles?: IRole[];
  IsConnectedGG?: boolean;
  GGAvatarUrl?: string;
}

export interface IBodyLogin {
  username?: string;
  password?: string;
}

export interface IBodyForgetPassword {
  username?: string;
  email?: string;
}

export interface IBodyAddAccount {
  email?: string;
  username?: string;
  fullname?: string;
  phone?: string;
  password?: string;
  verify_password?: string;
  role?: 'admin' | 'user' | 'client';
}

export interface IBodyChangeInfo {
  Email: string;
  FullName: string;
  Phone: string;
}

export interface IParamsConnectGoogle {
  idUser?: string;
  callbackUri?: string;
}