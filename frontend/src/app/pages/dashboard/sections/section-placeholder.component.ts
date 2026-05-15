import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-section-placeholder',
  template: `
    <div class="section-view">
      <button class="back-button" (click)="goBack()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to menu
      </button>

      <div class="section-header" [style.--section-accent]="sectionColor">
        <div class="section-icon-wrapper" [style.background]="sectionColor + '15'">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" [style.color]="sectionColor">
            @switch (sectionIcon) {
              @case ('checklist') {
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <path d="M9 14l2 2 4-4"/>
              }
              @case ('calendar') {
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <circle cx="12" cy="15" r="1"/>
                <circle cx="16" cy="15" r="1"/>
                <circle cx="8" cy="15" r="1"/>
              }
              @case ('home') {
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              }
              @case ('food') {
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              }
              @case ('cart') {
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              }
              @case ('wallet') {
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
                <path d="M18 14a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
              }
            }
          </svg>
        </div>
        <div class="section-text">
          <h2 class="section-title">{{ sectionTitle }}</h2>
          <p class="section-desc">{{ sectionDescription }}</p>
        </div>
      </div>

      <div class="section-placeholder">
        <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <h3>Coming Soon</h3>
        <p>This section is under development and will be available soon.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .section-view { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .back-button {
      display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.75rem;
      border: none; background: var(--color-bg); border-radius: var(--radius-sm); cursor: pointer;
      font-size: 0.8125rem; font-weight: 500; color: var(--color-text-secondary);
      font-family: var(--font-family); transition: all 0.15s; margin-bottom: 1.5rem;
    }
    .back-button:hover { background: var(--color-border); color: var(--color-text); }
    .back-button svg { width: 16px; height: 16px; }

    .section-header {
      display: flex; align-items: center; gap: 1rem;
      padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); margin-bottom: 2rem;
    }
    .section-icon-wrapper {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .card-icon { width: 28px; height: 28px; }
    .section-text { flex: 1; }
    .section-title { margin: 0 0 0.125rem; font-size: 1.25rem; font-weight: 700; color: var(--color-text); }
    .section-desc { margin: 0; font-size: 0.8125rem; color: var(--color-text-secondary); }

    .section-placeholder {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 4rem 2rem; text-align: center;
    }
    .placeholder-icon {
      width: 48px; height: 48px; color: var(--color-text-muted); margin-bottom: 1rem; opacity: 0.5;
    }
    .section-placeholder h3 { margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 600; color: var(--color-text); }
    .section-placeholder p { margin: 0; font-size: 0.875rem; color: var(--color-text-muted); max-width: 320px; }
  `],
})
export class SectionPlaceholderComponent implements OnInit {
  sectionTitle = '';
  sectionDescription = '';
  sectionIcon = '';
  sectionColor = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.sectionTitle = data['title'];
      this.sectionDescription = data['description'];
      this.sectionIcon = data['icon'];
      this.sectionColor = data['color'];
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
