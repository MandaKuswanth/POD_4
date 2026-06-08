import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword?: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  mustResetPassword: boolean;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = 'http://localhost:5000/api';
  private readonly TOKEN_KEY = 'token';

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.API_URL}/login`,
      data
    );
  }

  resetPassword(
    data: ResetPasswordRequest
  ): Observable<any> {
    return this.http.post(
      `${this.API_URL}/reset-password`,
      data
    );
  }

  saveLoginData(response: LoginResponse): void {
    if (response?.token) {
      localStorage.setItem(
        this.TOKEN_KEY,
        response.token
      );
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.TOKEN_KEY
    );
  }

  isLoggedIn(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (!decoded.exp) {
        return true;
      }

      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getRole(): string | null {
    return this.getDecodedToken()?.role ?? null;
  }

  getUser(): DecodedToken | null {
    return this.getDecodedToken();
  }

  mustResetPassword(): boolean {
    return (
      this.getDecodedToken()
        ?.mustResetPassword ?? false
    );
  }

  isAdminOrTechnician(): boolean {
    const role = this.getRole();

    return (
      role === 'ADMIN' ||
      role === 'TECHNICIAN'
    );
  }

  private getDecodedToken():
    | DecodedToken
    | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }
}