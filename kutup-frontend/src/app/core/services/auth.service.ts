import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';

interface RegisterAuthResponse {
  message?: string;
}

interface AuthResponse {
  accessToken?: string;   // may include "Bearer " prefix
  refreshToken?: string;  // optional
  userId?: string | number;
  message?: string;
}

interface UserRequest {
  username: string;
  password: string;
  email?: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;
  private readonly storageKey = 'auth.token';
  private readonly userKey = 'auth.userId';
  private readonly refreshKey = 'auth.refresh';

  register(payload: { username: string; password: string; email: string }) {
    return this.http.post<RegisterAuthResponse>(`${this.baseUrl}/register`, payload);
  }
  resendVerification(email: string) {
    // Backend expects email as query param
    return this.http.post<string>(`${this.baseUrl}/resend-verification`, null, {
      params: { email }
    });
  }


  login(payload: UserRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload);
  }

  refresh(userId: string | number, refreshToken: string) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { userId, refreshToken });
  }

  setSession(res: AuthResponse) {
    const tokenRaw = res.accessToken ?? '';
    const token = tokenRaw.startsWith('Bearer ') ? tokenRaw.substring(7) : tokenRaw; // normalize
    if (token) localStorage.setItem(this.storageKey, token);
    if (res.userId != null) localStorage.setItem(this.userKey, String(res.userId));
    if (res.refreshToken) localStorage.setItem(this.refreshKey, res.refreshToken);
  }

  clearSession() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}
