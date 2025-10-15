import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth';
import { Sidebar } from '../../shared/components/ui/sidebar/sidebar';
import { Header } from '../../shared/components/ui/header/header';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, Header],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  sidebarCollapsed: boolean = false;
  currentRole: string = 'ADMIN';

  get userProfile() {
    const user = this.authService.getCurrentUser();
    return {
      name: user ? `${user.firstName} ${user.lastName}` : 'admin general',
      email: user?.email || 'admin.general@empresa.com',
      avatar: '',
      roles: ['ADMIN', 'SUPER_ADMIN'],
      currentRole: this.currentRole
    };
  }

  onSidebarToggled(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onToggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onRoleChanged(newRole: string): void {
    this.currentRole = newRole;
    // Aquí puedes agregar lógica adicional para cambiar el contexto del usuario
    // Por ejemplo, actualizar permisos, redirigir a dashboard específico, etc.

    if (newRole === 'SUPER_ADMIN') {
      this.router.navigate(['/super-admin/dashboard']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

}
