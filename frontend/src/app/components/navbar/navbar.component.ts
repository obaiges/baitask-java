import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-navbar',
  imports: [SettingsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  dropdownOpen = false;
  settingsOpen = false;
  isDarkTheme = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark-theme');
    }
  }

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

  toggleTheme(): void {
    this.dropdownOpen = false;
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
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
