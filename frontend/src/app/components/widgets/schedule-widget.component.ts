import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../../pages/dashboard/sections/schedule/schedule.service';
import { ScheduleEvent } from '../../pages/dashboard/sections/schedule/schedule.models';

@Component({
  selector: 'app-schedule-widget',
  imports: [RouterLink],
  template: `
    <a [routerLink]="'/dashboard/schedule'" class="schedule-widget">
      <svg class="sw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="12" cy="15" r="1"/>
        <circle cx="16" cy="15" r="1"/>
        <circle cx="8" cy="15" r="1"/>
      </svg>
      <div class="sw-body">
        <span class="sw-label">Today's Schedule</span>
        <span class="sw-date">{{ todayLabel }}</span>
        @if (loading) {
          <div class="sw-loading">
            <div class="sw-loading-dot"></div>
            <span>Loading...</span>
          </div>
        } @else if (events.length === 0) {
          <div class="sw-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>No events today</span>
          </div>
        } @else {
          <div class="sw-count-row">
            <span class="sw-count">{{ events.length }} event{{ events.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="sw-events">
            @for (evt of events.slice(0, 4); track evt.id) {
              <div class="sw-event" [style.--evt-color]="evt.color || '#667eea'">
                <span class="sw-event-dot"></span>
                @if (evt.startTime) {
                  <span class="sw-event-time">{{ evt.startTime.substring(0, 5) }}</span>
                }
                <span class="sw-event-title">{{ evt.title }}</span>
              </div>
            }
            @if (events.length > 4) {
              <div class="sw-more">+{{ events.length - 4 }} more</div>
            }
          </div>
        }
      </div>
      <svg class="sw-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </a>
  `,
  styles: [`
    .schedule-widget {
      display: flex; align-items: flex-start; gap: 1rem;
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-surface); text-decoration: none;
      transition: all 0.2s ease; cursor: pointer; color: inherit;
      padding: 1rem 1.25rem;
    }
    .schedule-widget:hover {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px color-mix(in srgb, #f59e0b 12%, transparent);
      transform: translateY(-1px);
    }
    .sw-icon { width: 28px; height: 28px; color: #f59e0b; flex-shrink: 0; margin-top: 0.125rem; }
    .sw-body { flex: 1; display: flex; flex-direction: column; gap: 0.375rem; min-width: 0; }
    .sw-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-muted); }
    .sw-date { font-size: 0.6875rem; color: var(--color-text-secondary); margin-top: -0.25rem; }
    .sw-loading { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-text-muted); padding: 0.5rem 0; }
    .sw-loading-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-muted); animation: pulse 1.4s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    .sw-empty { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--color-text-muted); padding: 0.5rem 0; }
    .sw-empty svg { width: 16px; height: 16px; flex-shrink: 0; }
    .sw-count-row { margin-bottom: 0.125rem; }
    .sw-count { font-size: 0.8125rem; font-weight: 600; color: var(--color-text); }
    .sw-events { display: flex; flex-direction: column; gap: 0.25rem; }
    .sw-event { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--color-text-secondary); }
    .sw-event-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--evt-color, #667eea); flex-shrink: 0; }
    .sw-event-time { font-weight: 600; color: var(--color-text); flex-shrink: 0; }
    .sw-event-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sw-more { font-size: 0.6875rem; font-weight: 600; color: var(--color-text-muted); padding-left: 0.75rem; }
    .sw-arrow { width: 18px; height: 18px; color: var(--color-text-muted); flex-shrink: 0; margin-top: 0.125rem; transition: transform 0.2s; }
    .schedule-widget:hover .sw-arrow { transform: translateX(3px); color: #f59e0b; }
  `],
})
export class ScheduleWidgetComponent implements OnInit, OnDestroy {
  events: ScheduleEvent[] = [];
  loading = true;
  todayLabel = '';
  private today = new Date();
  private refreshInterval: any;

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.updateTodayLabel();
    this.loadTodayEvents();
    this.refreshInterval = setInterval(() => {
      this.loadTodayEvents();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private updateTodayLabel(): void {
    this.today = new Date();
    const d = this.today;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.todayLabel = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  private loadTodayEvents(): void {
    const y = this.today.getFullYear();
    const m = this.today.getMonth() + 1;
    this.scheduleService.getEvents(y, m).subscribe({
      next: events => {
        const dateStr = this.toLocalDate(this.today);
        this.events = events.filter(e => e.displayDate === dateStr);
        this.loading = false;
      },
      error: () => {
        this.events = [];
        this.loading = false;
      },
    });
  }

  private toLocalDate(d: Date): string {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
}
