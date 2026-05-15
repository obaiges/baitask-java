import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profit-widget',
  imports: [RouterLink],
  template: `
    <a [routerLink]="link()" [class]="'profit-widget profit-widget--' + size()">
      <svg class="pw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
        <path d="M18 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
      </svg>
      <div class="pw-body">
        <span class="pw-label">{{ label() }}</span>
        <div class="pw-row">
          <span class="pw-amount" [class.negative]="amount() < 0">{{ formattedAmount() }}</span>
          @if (amount() >= 0) {
            <span class="pw-indicator arrow-up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </span>
          } @else {
            <span class="pw-indicator arrow-down">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </span>
          }
        </div>
      </div>
      <svg class="pw-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </a>
  `,
  styles: [`
    .profit-widget {
      display: flex; align-items: center; gap: 1rem;
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-surface); text-decoration: none;
      transition: all 0.2s ease; cursor: pointer; color: inherit;
    }
    .profit-widget:hover {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px color-mix(in srgb, #8b5cf6 12%, transparent);
      transform: translateY(-1px);
    }
    .profit-widget--sm { padding: 0.75rem 1rem; }
    .profit-widget--md { padding: 1rem 1.25rem; }
    .profit-widget--lg { padding: 1.25rem 1.5rem; }
    .profit-widget--xl { padding: 1.5rem 2rem; }
    .pw-icon { width: 28px; height: 28px; color: #8b5cf6; flex-shrink: 0; }
    .pw-body { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
    .pw-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-muted); }
    .pw-row { display: flex; align-items: center; gap: 0.375rem; }
    .pw-amount { font-size: 1.25rem; font-weight: 700; color: #8b5cf6; }
    .pw-amount.negative { color: #ef4444; }
    .pw-indicator { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
    .pw-indicator svg { width: 14px; height: 14px; }
    .pw-indicator.arrow-up { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
    .pw-indicator.arrow-down { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
    .pw-arrow { width: 18px; height: 18px; color: var(--color-text-muted); flex-shrink: 0; transition: transform 0.2s; }
    .profit-widget:hover .pw-arrow { transform: translateX(3px); color: #8b5cf6; }
  `],
})
export class ProfitWidgetComponent {
  label = input('Monthly Profit');
  amount = input(0);
  link = input('/dashboard/money');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  formattedAmount(): string {
    return '$' + this.amount().toFixed(2);
  }
}
