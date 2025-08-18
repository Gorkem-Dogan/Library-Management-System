// File: src/app/core/interceptors/auth.interceptor.ts
// Fix: Only handle 401s from API URLs, skip assets/pages, avoid redirect loops, and don't clear session on auth endpoints.

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const apiBase = environment.apiBaseUrl.replace(/\/+$/, ''); // normalize trailing slash
  const isApiUrl = req.url.startsWith(apiBase);
  const isAuthUrl = req.url.includes('/auth/'); // your auth endpoints
  const token = auth.getToken();

  const authReq = (!isAuthUrl && isApiUrl && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: any) => {
      // Only handle 401s coming from API endpoints (not images, html, etc.)
      if (err instanceof HttpErrorResponse && err.status === 401 && isApiUrl) {
        const currentUrl = router.url || '';
        const alreadyOnLogin = currentUrl.startsWith('/login');

        // Do not nuke session for auth endpoints themselves
        if (!isAuthUrl) {
          auth.clearSession();
        }

        // Avoid redirect loop if we're already on login
        if (!alreadyOnLogin) {
          router.navigateByUrl('/login');
        }
      }
      return throwError(() => err);
    })
  );
};
