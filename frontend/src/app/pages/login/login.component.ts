import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  isRegisterMode = false;
  showPassword = false;

  passwordLength(): number { return this.password.length; }
  hasMinLength(): boolean { return this.password.length >= 8; }
  hasUpperCase(): boolean { return /[A-Z]/.test(this.password); }
  hasLowerCase(): boolean { return /[a-z]/.test(this.password); }
  hasNumber(): boolean { return /\d/.test(this.password); }
  hasSpecialChar(): boolean { return /[!@#$%^&*(),.?":{}|<>]/.test(this.password); }

  passwordStrength(): string {
    const score = [this.hasMinLength(), this.hasUpperCase(), this.hasLowerCase(), this.hasNumber(), this.hasSpecialChar()].filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.error = '';
  }

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Username and password are required.';
      return;
    }

    this.loading = true;
    this.error = '';

    const action = this.isRegisterMode
      ? this.authService.register(this.username, this.password)
      : this.authService.login(this.username, this.password);

    action.subscribe({
      next: (res) => {
        if (res.accessToken) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'An unexpected error occurred.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
