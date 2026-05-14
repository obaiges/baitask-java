import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-navbar',
  imports: [SettingsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  dropdownOpen = false;
  settingsOpen = false;

  constructor(private authService: AuthService) {}

  get username(): string | null {
    return this.authService.getUsername();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  openSettings(): void {
    this.dropdownOpen = false;
    this.settingsOpen = true;
  }

  closeSettings(): void {
    this.settingsOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }
}
