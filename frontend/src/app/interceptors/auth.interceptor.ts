import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, tap, throwError } from 'rxjs';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isTokenExpired() && authService.hasRefreshToken()) {
    return refreshAccessToken(authService).pipe(
      switchMap(newToken => {
        if (!newToken) {
          authService.logout();
          return throwError(() => new Error('Session expired'));
        }
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });
        return next(cloned).pipe(tap(event => saveNewToken(event, authService)));
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
    tap(event => saveNewToken(event, authService)),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403 && authService.hasRefreshToken()) {
        return refreshAccessToken(authService).pipe(
          switchMap(newToken => {
            if (!newToken) {
              authService.logout();
              return throwError(() => error);
            }
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(cloned).pipe(tap(event => saveNewToken(event, authService)));
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          }),
        );
      }
      if (error.status === 403) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};

function saveNewToken(event: any, authService: AuthService): void {
  if (event instanceof HttpResponse) {
    const newToken = event.headers.get('X-Access-Token');
    if (newToken && authService.getAccessToken()) {
      localStorage.setItem('access_token', newToken);
    }
  }
}

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
