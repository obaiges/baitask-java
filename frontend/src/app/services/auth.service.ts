import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

export interface AuthResponse {
  id: number | null;
  username: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private _refreshToken: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { username, password })
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken: this._refreshToken })
      .pipe(tap(res => this.handleAuthResponse(res)));
  }

  hasRefreshToken(): boolean {
    return !!this._refreshToken;
  }

  logout(): void {
    this._refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getTokenExpiry(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const exp = this.getTokenExpiry();
    if (exp === null) return true;
    return Date.now() >= exp - 60000;
  }

  private handleAuthResponse(res: AuthResponse): void {
    if (res.accessToken) {
      localStorage.setItem('access_token', res.accessToken);
    }
    if (res.refreshToken) {
      this._refreshToken = res.refreshToken;
    }
    if (res.username) {
      localStorage.setItem('username', res.username);
    }
  }
}
