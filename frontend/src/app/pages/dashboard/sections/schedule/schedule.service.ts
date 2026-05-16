import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ScheduleEvent, CreateScheduleEventRequest } from './schedule.models';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEvents(year?: number, month?: number, userId?: number): Observable<ScheduleEvent[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);
    if (userId) params = params.set('userId', userId);
    return this.http.get<ScheduleEvent[]>(`${this.apiUrl}/schedule/events`, { params });
  }

  createEvent(data: CreateScheduleEventRequest): Observable<ScheduleEvent> {
    return this.http.post<ScheduleEvent>(`${this.apiUrl}/schedule/events`, data);
  }

  updateEvent(id: number, data: CreateScheduleEventRequest): Observable<ScheduleEvent> {
    return this.http.put<ScheduleEvent>(`${this.apiUrl}/schedule/events/${id}`, data);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/schedule/events/${id}`);
  }
}
