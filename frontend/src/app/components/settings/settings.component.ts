import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';
import {
  FamilyMember,
  FamilyPosition,
} from '../../models/settings.models';

export const MEMBER_COLORS = [
  '#667eea', '#ef4444', '#f59e0b', '#22c55e',
  '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6',
];

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  readonly memberColors = MEMBER_COLORS;
  @Output() close = new EventEmitter<void>();

  activeTab: 'family' | 'positions' | 'password' | 'appearance' = 'family';

  members: FamilyMember[] = [];
  positions: FamilyPosition[] = [];
  currentUsername: string | null = null;

  newPositionName = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccess = '';

  selectedColor = '#667eea';

  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUsername = this.authService.getUsername();
    this.loadData();
  }

  loadData(): void {
    this.settingsService.getMembers().subscribe(members => {
      this.members = members;
      const me = members.find(m => m.username === this.currentUsername);
      if (me) {
        this.selectedColor = me.color;
      }
    });
    this.settingsService.getPositions().subscribe(positions => {
      this.positions = positions;
    });
  }

  get currentMember(): FamilyMember | undefined {
    return this.members.find(m => m.username === this.currentUsername);
  }

  isAdmin(): boolean {
    return this.currentMember?.role === 'ADMIN';
  }

  setActiveTab(tab: 'family' | 'positions' | 'password' | 'appearance'): void {
    this.activeTab = tab;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  updatePosition(member: FamilyMember, event: Event): void {
    const positionId = (event.target as HTMLSelectElement).value;
    this.settingsService.updateMember(member.id, {
      positionId: positionId ? Number(positionId) : null,
    }).subscribe(updated => {
      Object.assign(member, updated);
    });
  }

  updateColor(member: FamilyMember, color: string): void {
    this.settingsService.updateMember(member.id, { color }).subscribe(updated => {
      Object.assign(member, updated);
      if (member.username === this.currentUsername) {
        this.selectedColor = color;
      }
    });
  }

  removeMember(member: FamilyMember): void {
    if (!confirm(`Remove "${member.username}" from the family?`)) return;
    this.settingsService.removeMember(member.id).subscribe(() => {
      this.members = this.members.filter(m => m.id !== member.id);
    });
  }

  addPosition(): void {
    const name = this.newPositionName.trim();
    if (!name) return;
    this.settingsService.createPosition(name).subscribe(position => {
      this.positions.push(position);
      this.newPositionName = '';
    });
  }

  deletePosition(position: FamilyPosition): void {
    if (!confirm(`Delete position "${position.name}"?`)) return;
    this.settingsService.deletePosition(position.id).subscribe(() => {
      this.positions = this.positions.filter(p => p.id !== position.id);
    });
  }

  onChangePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'All fields are required.';
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError = 'New password must be at least 8 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    this.settingsService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    }).subscribe({
      next: () => {
        this.passwordSuccess = 'Password changed successfully.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.passwordError = 'Current password is incorrect.';
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}
