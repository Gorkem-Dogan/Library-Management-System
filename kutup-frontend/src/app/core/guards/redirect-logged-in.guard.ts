// File: src/app/core/guards/redirect-logged-in.guard.ts
// Purpose: Prevent logged-in users from accessing login/register routes; redirect to /home
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const redirectLoggedInToHomeGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.parseUrl('/home') : true;
};
