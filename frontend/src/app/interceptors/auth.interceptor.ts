import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, throwError } from 'rxjs';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isTokenExpired() && authService.hasRefreshToken()) {
    return refreshAccessToken(authService).pipe(
      switchMap(newToken => {
        if (newToken) {
          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(cloned);
        }
        authService.logout();
        return throwError(() => new Error('Session expired'));
      }),
    );
  }

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        if (authService.hasRefreshToken()) {
          return refreshAccessToken(authService).pipe(
            switchMap(newToken => {
              if (newToken) {
                const cloned = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next(cloned);
              }
              authService.logout();
              return throwError(() => error);
            }),
            catchError(() => {
              authService.logout();
              return throwError(() => error);
            }),
          );
        }
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};

function refreshAccessToken(authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap(res => {
        isRefreshing = false;
        if (res.accessToken) {
          refreshSubject.next(res.accessToken);
          return [res.accessToken];
        }
        refreshSubject.error('Refresh failed');
        return [];
      }),
      catchError(err => {
        isRefreshing = false;
        refreshSubject.error(err);
        return throwError(() => err);
      }),
    );
  }

  return refreshSubject.pipe(
    filter(token => token !== null),
    switchMap(token => [token!]),
  );
}
