import { Routes } from '@angular/router';
import { UserCanActive } from './shared/services/auth/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((c) => c.PmLoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./sign-up/sign-up.component').then((m) => m.PmSignUpComponent)
  },
  {
    path: 'forget-password',
    loadComponent: () => import('./forget-password/forget-password.component').then((m) => m.PmForgetPasswordComponent)
  },
  {
    path: 'change-password',
    loadComponent: () => import('./change-password/change-password.component').then((m) => m.PmChangePasswordComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.PmLayoutComponent),
    canActivate: [UserCanActive],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'account-management'
      },
      {
        path: 'account-management',
        loadComponent: () => import('./account-management/account-management.component').then((m) => m.PmAccountManagementComponent)
      },
      {
        path: 'team',
        loadComponent: () => import('./team/team.component').then((m) => m.PmTeamComponent)
      },
      {
        path: 'check-in',
        loadComponent: () => import('./check-in/check-in.component').then((m) => m.PmCheckInComponent)
      },
      {
        path: 'product-category',
        loadComponent: () => import('./product-category/product-category.component').then((m) => m.PmProductCategoryComponent)
      },
      {
        path: 'product',
        loadComponent: () => import('./product/product.component').then((m) => m.PmProductComponent)
      },
      {
        path: 'room-schedule',
        loadComponent: () => import('./room-schedule/room-schedule.component').then((m) => m.PmRoomScheduleComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then(c => c.PmNotFoundComponent)
  }
];
