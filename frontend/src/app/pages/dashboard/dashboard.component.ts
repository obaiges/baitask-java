import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

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
  imports: [NavbarComponent, RouterOutlet, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  showMenu = true;
  username: string | null;

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

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.username = this.authService.getUsername();
  }

  ngOnInit(): void {
    this.showMenu = this.router.url === '/dashboard';

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.showMenu = this.router.url === '/dashboard';
      });
  }
}
