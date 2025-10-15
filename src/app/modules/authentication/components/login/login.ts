import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/auth/services/auth';
import { LoginRequest } from '../../../../core/auth/models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [MessageService]
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onEmailChange(event: any): void {
    this.username = event.target.value;
  }

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const loginRequest: LoginRequest = {
      username: this.username,
      password: this.password,
      rememberMe: this.rememberMe
    };

    this.authService.login(loginRequest).subscribe({
      next: (user) => {
        // No necesitamos redirigir aquí, el servicio de autenticación se encarga de redirigir a la pantalla de bienvenida
        // Y la pantalla de bienvenida se encarga de redirigir al dashboard según el rol
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';

        this.messageService.add({
          severity: 'error',
          summary: 'Error de autenticación',
          detail: this.errorMessage || 'Error desconocido'
        });

        console.error('Error de autenticación:', error);
      }
    });
  }
}
