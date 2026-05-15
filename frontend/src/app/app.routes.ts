import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'tasks',
        loadComponent: () => import('./pages/dashboard/sections/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
        data: { title: 'Classic Tasks', description: 'Manage your tasks with TODO, DOING, DONE boards', icon: 'checklist', color: '#667eea' },
      },
      {
        path: 'schedule',
        loadComponent: () => import('./pages/dashboard/sections/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
        data: { title: 'Schedule', description: 'Meetings, events, and important tasks', icon: 'calendar', color: '#f59e0b' },
      },
      {
        path: 'daily',
        loadComponent: () => import('./pages/dashboard/sections/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
        data: { title: 'Daily House Tasks', description: 'Make lunch, clean bath, and more', icon: 'home', color: '#22c55e' },
      },
      {
        path: 'diets',
        loadComponent: () => import('./pages/dashboard/sections/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
        data: { title: 'Diets & Recipes', description: 'Recipes with ingredients and elaboration steps', icon: 'food', color: '#ef4444' },
      },
      {
        path: 'shopping',
        loadComponent: () => import('./pages/dashboard/sections/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
        data: { title: 'Shopping List', description: 'Keep track of what you need to buy', icon: 'cart', color: '#06b6d4' },
      },
      {
        path: 'money',
        loadComponent: () => import('./pages/dashboard/sections/section-placeholder.component').then(m => m.SectionPlaceholderComponent),
        data: { title: 'Money Management', description: 'Income, expenditure, and month overview', icon: 'wallet', color: '#8b5cf6' },
      },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
