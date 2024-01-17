import { IFunction } from "../../shared/services/function/interfaces/function.interface";

export const menuDefault = (): IFunction[] => {
  return [
    //   {
    //   Name: 'Trang chủ',
    //   Icon: 'home',
    //   Url: '/dashboard',
    //   IsMenu: false
    // },
    {
      Name: 'Quản lý',
      Icon: 'user',
      IsMenu: false,
      FunctionChilds: [
        {
          Name: 'Tài khoản',
          Url: '/account-management',
          IsMenu: false,
        },
        {
          Name: 'Team',
          Url: '/team',
          IsMenu: false,
        },
        {
          Name: 'Chấm công',
          Url: '/check-in',
          IsMenu: false,
        },
        {
          Name: 'Danh mục sản phẩm',
          Url: '/product-category',
          IsMenu: false,
        },
        {
          Name: 'Sản phẩm',
          Url: '/product',
          IsMenu: false,
        },
        {
          Name: 'Đặt phòng',
          Url: '/room-schedule',
          IsMenu: false,
        }
      ]
    },
    {
      Name: 'Cài đặt',
      Icon: 'setting',
      IsMenu: false,
      FunctionChilds: [
        // {
        //   Name: 'Thông tin tài khoản',
        //   Url: '/account',
        //   IsMenu: false,
        // },
        // {
        //   Name: 'Cấu hình dữ liệu khuôn mặt',
        //   Url: '/config-face',
        //   IsMenu: false,
        // },
        // {
        //   Name: 'Cấu hình google calendar',
        //   Url: '/config-google-calendar',
        //   IsMenu: false,
        // },
        // {
        //   Name: 'Lịch sử điểm danh',
        //   Url: '/attendance-history',
        //   IsMenu: false,
        // },
        // {
        //   Name: 'Phân quyền',
        //   Url: '/role',
        //   IsMenu: false,
        // },
        // {
        //   Name: 'Chức năng',
        //   Url: '/function',
        //   IsMenu: false,
        // },
        // {
        //   Name: 'Danh mục',
        //   Url: '/dictionary',
        //   IsMenu: false,
        // },
        // {
        //   Name: 'Kiểu người tham gia cuộc họp',
        //   Url: '/attendance-type',
        //   IsMenu: false,
        // },
        {
          Name: 'Đăng xuất',
          Url: '/logout',
          IsMenu: false,
        }
      ]
    }];
};