// File: src/app/app.routes.ts
import {Routes} from '@angular/router';
import { redirectLoggedInToHomeGuard } from './core/guards/redirect-logged-in.guard';
import { requireAuthGuard } from './core/guards/require-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [redirectLoggedInToHomeGuard],
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canMatch: [redirectLoggedInToHomeGuard],
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/books-page.component').then(m => m.BooksPageComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/users-page.component').then(m => m.UsersPageComponent),
  },
  {
    path: 'loans',
    canMatch: [requireAuthGuard],
    loadComponent: () =>
      import('./features/loans/loans-page.component').then(m => m.LoansPageComponent),
  },
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: '**', redirectTo: 'home'}
];
