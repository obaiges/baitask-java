export interface FamilyMember {
  id: number;
  username: string;
  role: 'ADMIN' | 'MEMBER';
  positionId: number | null;
  positionName: string | null;
  color: string;
}

export interface FamilyPosition {
  id: number;
  name: string;
}

export interface UpdateMemberRequest {
  positionId?: number | null;
  color?: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface CreatePositionRequest {
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
