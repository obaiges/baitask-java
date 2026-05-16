import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ScheduleService } from './schedule.service';
import { AuthService } from '../../../../services/auth.service';
import { SettingsService } from '../../../../services/settings.service';
import { FamilyMember } from '../../../../models/settings.models';
import {
  ScheduleEvent, CreateScheduleEventRequest,
  RECURRING_TYPES, EVENT_COLORS, MONTHS, DAYS_OF_WEEK,
} from './schedule.models';

@Component({
  selector: 'app-schedule',
  imports: [FormsModule, RouterLink],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit {
  now = new Date();
  selectedYear = this.now.getFullYear();
  selectedMonth = this.now.getMonth() + 1;
  viewMode: 'month' | 'day' = 'month';
  selectedDate: Date | null = null;

  events: ScheduleEvent[] = [];
  monthEvents: ScheduleEvent[] = [];

  members: FamilyMember[] = [];
  selectedUserId: number | null = null;
  currentUserId: number | null = null;
  isAdmin = false;

  months = MONTHS;
  daysOfWeek = DAYS_OF_WEEK;

  /* Calendar */
  calendarDays: (number | null)[][] = [];

  /* Day view */
  dayEvents: ScheduleEvent[] = [];
  hours = Array.from({ length: 24 }, (_, i) => i);

  /* Form modal */
  showForm = false;
  editingEvent: ScheduleEvent | null = null;
  formTitle = '';
  formDescription = '';
  formDate = '';
  formStartTime = '';
  formEndTime = '';
  formColor = '#667eea';
  formIsRecurring = false;
  formRecurringType = 'MONTHLY';
  formRecurringEndDate = '';
  formError = '';

  recurringTypes = RECURRING_TYPES;
  eventColors = EVENT_COLORS;

  constructor(
    private scheduleService: ScheduleService,
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.settingsService.getMembers().subscribe(members => {
      this.members = members;
      const me = members.find(m => m.username === this.authService.getUsername());
      if (me) {
        this.currentUserId = me.id;
        this.isAdmin = me.role === 'ADMIN';
        this.selectedUserId = me.id;
        this.loadEvents();
      }
    });
  }

  get isViewingOwn(): boolean {
    return this.selectedUserId === this.currentUserId;
  }

  onUserChange(userId: number): void {
    this.selectedUserId = Number(userId);
    this.loadEvents();
  }

  /* ── Navigation ── */

  prevMonth(): void {
    if (this.selectedMonth === 1) { this.selectedMonth = 12; this.selectedYear--; }
    else { this.selectedMonth--; }
    this.loadEvents();
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) { this.selectedMonth = 1; this.selectedYear++; }
    else { this.selectedMonth++; }
    this.loadEvents();
  }

  goToDay(date: Date): void {
    this.selectedDate = date;
    this.viewMode = 'day';
    this.filterDayEvents();
  }

  goToMonth(): void {
    this.viewMode = 'month';
    this.selectedDate = null;
  }

  prevDay(): void {
    if (!this.selectedDate) return;
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.filterDayEvents();
  }

  nextDay(): void {
    if (!this.selectedDate) return;
    this.selectedDate = new Date(this.selectedDate);
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.filterDayEvents();
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return date.getFullYear() === t.getFullYear()
      && date.getMonth() === t.getMonth()
      && date.getDate() === t.getDate();
  }

  isSelectedDate(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.getFullYear() === this.selectedDate.getFullYear()
      && date.getMonth() === this.selectedDate.getMonth()
      && date.getDate() === this.selectedDate.getDate();
  }

  /* ── Load events ── */

  loadEvents(): void {
    this.scheduleService.getEvents(this.selectedYear, this.selectedMonth, this.selectedUserId ?? undefined)
      .subscribe(events => {
        this.events = events;
        this.buildCalendar();
        if (this.viewMode === 'day' && this.selectedDate) {
          this.filterDayEvents();
        }
      });
  }

  /* ── Calendar ── */

  private buildCalendar(): void {
    const firstDay = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const lastDay = new Date(this.selectedYear, this.selectedMonth, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    this.calendarDays = [];
    let row: (number | null)[] = [];

    for (let i = 0; i < startPad; i++) {
      row.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      row.push(d);
      if (row.length === 7) {
        this.calendarDays.push(row);
        row = [];
      }
    }

    if (row.length > 0) {
      while (row.length < 7) row.push(null);
      this.calendarDays.push(row);
    }
  }

  getEventsForDay(day: number): ScheduleEvent[] {
    const dateStr = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return this.events.filter(e => e.displayDate === dateStr);
  }

  /* ── Day view ── */

  private filterDayEvents(): void {
    if (!this.selectedDate) return;
    const dateStr = this.toLocalDate(this.selectedDate);
    this.dayEvents = this.events.filter(e => e.displayDate === dateStr)
      .sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return -1;
        if (!b.startTime) return 1;
        return a.startTime.localeCompare(b.startTime);
      });
  }

  getEventsForHour(hour: number): ScheduleEvent[] {
    const hh = String(hour).padStart(2, '0');
    return this.dayEvents.filter(e => {
      if (!e.startTime) return false;
      return e.startTime.startsWith(hh);
    });
  }

  getEventsWithoutTime(): ScheduleEvent[] {
    return this.dayEvents.filter(e => !e.startTime);
  }

  selectedDateLabel(): string {
    if (!this.selectedDate) return '';
    const d = this.selectedDate;
    return `${this.daysOfWeek[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  /* ── Form ── */

  openAddForm(date?: string): void {
    this.editingEvent = null;
    this.formTitle = '';
    this.formDescription = '';
    this.formDate = date || this.toLocalDate(new Date());
    this.formStartTime = '';
    this.formEndTime = '';
    this.formColor = '#667eea';
    this.formIsRecurring = false;
    this.formRecurringType = 'MONTHLY';
    this.formRecurringEndDate = '';
    this.formError = '';
    this.showForm = true;
  }

  openEditForm(event: ScheduleEvent): void {
    this.editingEvent = event;
    this.formTitle = event.title;
    this.formDescription = event.description || '';
    this.formDate = event.eventDate;
    this.formStartTime = event.startTime || '';
    this.formEndTime = event.endTime || '';
    this.formColor = event.color || '#667eea';
    this.formIsRecurring = event.recurring;
    this.formRecurringType = event.recurringType || 'MONTHLY';
    this.formRecurringEndDate = event.recurringEndDate || '';
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingEvent = null;
  }

  submitForm(): void {
    this.formError = '';
    if (!this.formTitle.trim()) { this.formError = 'Title is required'; return; }
    if (!this.formDate) { this.formError = 'Date is required'; return; }
    if (this.formIsRecurring && !this.formRecurringType) { this.formError = 'Recurring type is required'; return; }

    const data: CreateScheduleEventRequest = {
      title: this.formTitle.trim(),
      description: this.formDescription || undefined,
      date: this.formDate,
      startTime: this.formStartTime || null,
      endTime: this.formEndTime || null,
      color: this.formColor || undefined,
      recurring: this.formIsRecurring,
      recurringType: this.formIsRecurring ? this.formRecurringType : undefined,
      recurringEndDate: this.formIsRecurring ? (this.formRecurringEndDate || null) : null,
    };

    if (this.editingEvent) {
      this.scheduleService.updateEvent(this.editingEvent.id, data).subscribe({
        next: () => { this.closeForm(); this.loadEvents(); },
        error: err => this.formError = err.error?.error || 'Failed to update event',
      });
    } else {
      this.scheduleService.createEvent(data).subscribe({
        next: () => { this.closeForm(); this.loadEvents(); },
        error: err => this.formError = err.error?.error || 'Failed to create event',
      });
    }
  }

  deleteEvent(event: ScheduleEvent): void {
    if (!confirm(`Delete event "${event.title}"?`)) return;
    this.scheduleService.deleteEvent(event.id).subscribe(() => {
      this.loadEvents();
    });
  }

  /* ── Utils ── */

  toLocalDate(d: Date): string {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  getMonthDay(day: number): Date {
    return new Date(this.selectedYear, this.selectedMonth - 1, day);
  }

  asDate(d: number): Date {
    return new Date(this.selectedYear, this.selectedMonth - 1, d);
  }

  isTodayDay(day: number): boolean {
    const t = new Date();
    return t.getFullYear() === this.selectedYear
      && t.getMonth() === this.selectedMonth - 1
      && t.getDate() === day;
  }

  timeLabel(time: string | null): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  }
}
