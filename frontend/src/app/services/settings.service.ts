import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  FamilyMember,
  FamilyPosition,
  UpdateMemberRequest,
  ChangePasswordRequest,
} from '../models/settings.models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMembers(): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(`${this.apiUrl}/settings/members`);
  }

  getPositions(): Observable<FamilyPosition[]> {
    return this.http.get<FamilyPosition[]>(`${this.apiUrl}/settings/positions`);
  }

  updateMember(id: number, data: UpdateMemberRequest): Observable<FamilyMember> {
    return this.http.put<FamilyMember>(`${this.apiUrl}/settings/members/${id}`, data);
  }

  removeMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/settings/members/${id}`);
  }

  createPosition(name: string): Observable<FamilyPosition> {
    return this.http.post<FamilyPosition>(`${this.apiUrl}/settings/positions`, { name });
  }

  deletePosition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/settings/positions/${id}`);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/auth/password`, data);
  }
}
