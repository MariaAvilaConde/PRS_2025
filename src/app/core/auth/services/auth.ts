import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { User, LoginRequest, LoginResponse, AuthState } from '../models/auth';
import { TokenService } from './token';
import { environment } from '../../../../environments/environment';
import { LoggingService } from '../../../core/config/logging.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly logger = inject(LoggingService);

  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null
  });

  private refreshTokenTimer: any;

  public authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación verificando si hay tokens válidos
   */
  private initializeAuth(): void {
    if (this.tokenService.hasValidToken()) {
      const accessToken = this.tokenService.getAccessToken();
      const refreshToken = this.tokenService.getRefreshToken();
      const payload = this.tokenService.getTokenPayload();

      if (payload && accessToken) {
        // Aquí necesitarías obtener la información del usuario desde el backend
        // o del localStorage si la guardaste previamente
        const userInfo = this.getUserInfoFromStorage();

        if (userInfo) {
          this.updateAuthState({
            isAuthenticated: true,
            user: userInfo,
            accessToken,
            refreshToken,
            loading: false,
            error: null
          });
          this.scheduleTokenRefresh();
        }
      }
    }
  }

  /**
   * Inicia sesión con credenciales
   */
  login(credentials: LoginRequest): Observable<User> {
    this.updateAuthState({ loading: true, error: null });

    // URL completa para la autenticación
    const loginUrl = `${environment.services.gateway}/auth/login`;

    this.logger.info('Iniciando proceso de login', { username: credentials.username });

    return this.http.post<LoginResponse>(loginUrl, credentials)
      .pipe(
        tap(response => {
          this.logger.debug('Respuesta completa de login', response);

          if (response.success) {
            const { accessToken, refreshToken, expiresIn, userInfo } = response.data;

            this.logger.info('Usuario autenticado con éxito', { id: userInfo.userId });
            this.logger.debug('Roles detectados para el usuario', userInfo.roles);            // Guardar tokens
            this.tokenService.setTokens(accessToken, refreshToken, expiresIn);

            // Guardar información del usuario
            this.setUserInfoInStorage(userInfo);

            // Actualizar estado
            this.updateAuthState({
              isAuthenticated: true,
              user: userInfo,
              accessToken,
              refreshToken,
              loading: false,
              error: null
            });

            this.scheduleTokenRefresh();

            // Navegar a la pantalla de bienvenida
            this.logger.debug('Navegando a pantalla de bienvenida');
            this.router.navigate(['/welcome']);
          } else {
            // Manejar respuesta de error del servidor
            const errorMessage = response.message || 'Credenciales inválidas';
            throw new Error(errorMessage);
          }
        }),
        map(response => {
          if (response.success) {
            return response.data.userInfo;
          } else {
            throw new Error(response.message || 'Error en la autenticación');
          }
        }),
        catchError(this.handleAuthError.bind(this))
      );
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    // Llamada opcional al endpoint de logout
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${environment.services.gateway}/auth/logout`, {
        refreshToken
      }).subscribe({
        error: (error) => {
          // No necesitamos manejar errores en logout
          this.logger.warn('Error al llamar al endpoint de logout (opcional)', error);
        }
      });
    }

    // Limpiar tokens y storage
    this.tokenService.clearTokens();
    this.clearUserInfoFromStorage();

    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null
    });

    // Navegar a la pantalla de despedida
    this.router.navigate(['/goodbye']);
  }

  /**
   * Refresca el token
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(`${environment.services.gateway}/auth/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success) {
          const { accessToken, refreshToken: newRefreshToken, expiresIn, userInfo } = response.data;

          this.tokenService.setTokens(accessToken, newRefreshToken, expiresIn);
          this.setUserInfoInStorage(userInfo);

          this.updateAuthState({
            isAuthenticated: true,
            user: userInfo,
            accessToken,
            refreshToken: newRefreshToken,
            loading: false,
            error: null
          });

          this.scheduleTokenRefresh();
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Programa la renovación automática del token
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    const tokenRemainingTime = this.tokenService.getTokenRemainingTime() * 1000;
    const refreshTime = Math.max(tokenRemainingTime - environment.security.tokenRefreshTime, 60000); // Mínimo 1 minuto

    this.refreshTokenTimer = setTimeout(() => {
      if (this.tokenService.getRefreshToken()) {
        this.refreshToken().subscribe({
          error: (error) => {
            this.logger.error('Error al refrescar el token', error);
          }
        });
      }
    }, refreshTime);
  }

  /**
   * Guarda información del usuario en localStorage
   */
  private setUserInfoInStorage(user: User): void {
    this.logger.debug('Guardando información de usuario', { userId: user.userId });
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  /**
   * Obtiene información del usuario desde localStorage
   */
  private getUserInfoFromStorage(): User | null {
    try {
      const userInfo = localStorage.getItem('user_info');
      const parsedUser = userInfo ? JSON.parse(userInfo) : null;

      if (parsedUser) {
        this.logger.debug('Usuario recuperado del almacenamiento', { userId: parsedUser.userId });
      } else {
        this.logger.debug('No se encontró información de usuario en el almacenamiento');
      }

      return parsedUser;
    } catch (error) {
      this.logger.error('Error al obtener información de usuario del almacenamiento', error);
      return null;
    }
  }

  /**
   * Limpia información del usuario del localStorage
   */
  private clearUserInfoFromStorage(): void {
    localStorage.removeItem('user_info');
  }

  /**
   * Actualiza el estado de autenticación
   */
  private updateAuthState(partialState: Partial<AuthState>): void {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      ...partialState
    });
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error de autenticación';

    if (error.status === 401) {
      errorMessage = 'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.';
    } else if (error.status === 403) {
      errorMessage = 'Acceso denegado. No tienes permisos para acceder a este recurso.';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.logger.error('Error de autenticación', { 
      status: error.status, 
      message: errorMessage,
      error: error 
    });

    this.updateAuthState({
      loading: false,
      error: errorMessage,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Obtiene el token de acceso actual
   */
  getAccessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }
}