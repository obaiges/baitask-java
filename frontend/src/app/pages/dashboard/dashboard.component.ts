import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProfitWidgetComponent } from '../../components/widgets/profit-widget.component';
import { AuthService } from '../../services/auth.service';
import { MoneyService } from './sections/money/money.service';
import { filter } from 'rxjs';
import { TransactionSummary, Objective } from './sections/money/money.models';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, RouterOutlet, RouterLink, ProfitWidgetComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  showMenu = true;
  username: string | null;
  monthlySummary: TransactionSummary | null = null;
  objectives: Objective[] = [];
  objectivesOnTrack = 0;

  sections: Section[] = [
    {
      id: 'tasks', title: 'Classic Tasks',
      description: 'Manage your tasks with TODO, DOING, DONE boards',
      icon: 'checklist', color: '#667eea', route: '/dashboard/tasks',
    },
    {
      id: 'schedule', title: 'Schedule',
      description: 'Meetings, events, and important tasks',
      icon: 'calendar', color: '#f59e0b', route: '/dashboard/schedule',
    },
    {
      id: 'daily', title: 'Daily House Tasks',
      description: 'Make lunch, clean bath, and more',
      icon: 'home', color: '#22c55e', route: '/dashboard/daily',
    },
    {
      id: 'diets', title: 'Diets & Recipes',
      description: 'Recipes with ingredients and elaboration steps',
      icon: 'food', color: '#ef4444', route: '/dashboard/diets',
    },
    {
      id: 'shopping', title: 'Shopping List',
      description: 'Keep track of what you need to buy',
      icon: 'cart', color: '#06b6d4', route: '/dashboard/shopping',
    },
    {
      id: 'money', title: 'Money Management',
      description: 'Income, expenditure, and month overview',
      icon: 'wallet', color: '#8b5cf6', route: '/dashboard/money',
    },
  ];

  now = new Date();

  constructor(
    private router: Router,
    private authService: AuthService,
    private moneyService: MoneyService,
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.showMenu = this.router.url === '/dashboard';

    this.loadMonthlyProfit();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.showMenu = this.router.url === '/dashboard';
        if (this.showMenu) this.loadMonthlyProfit();
      });
  }

  private loadMonthlyProfit(): void {
    const y = this.now.getFullYear();
    const m = this.now.getMonth() + 1;
    this.moneyService.getSummary(y, m).subscribe({
      next: s => this.monthlySummary = s,
      error: () => this.monthlySummary = null,
    });
    this.moneyService.getObjectives(m, y).subscribe({
      next: obj => {
        this.objectives = obj;
        this.objectivesOnTrack = obj.filter(o => {
          if (o.type === 'MONTHLY_SAVINGS_GOAL') {
            return o.currentAmount >= o.targetAmount;
          }
          return o.currentAmount / o.targetAmount <= 0.6;
        }).length;
      },
      error: () => { this.objectives = []; this.objectivesOnTrack = 0; },
    });
  }
}
