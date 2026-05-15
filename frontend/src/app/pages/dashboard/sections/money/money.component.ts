import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MoneyService } from './money.service';
import { AuthService } from '../../../../services/auth.service';
import { SettingsService } from '../../../../services/settings.service';
import { FamilyMember } from '../../../../models/settings.models';
import {
  Transaction, TransactionSummary, Objective, CreateObjectiveRequest,
  EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS
} from './money.models';

type Tab = 'dashboard' | 'reports' | 'objectives';

@Component({
  selector: 'app-money',
  imports: [FormsModule, RouterLink],
  templateUrl: './money.component.html',
  styleUrl: './money.component.scss',
})
export class MoneyComponent implements OnInit {
  now = new Date();
  selectedYear = this.now.getFullYear();
  selectedMonth = this.now.getMonth() + 1;

  summary: TransactionSummary | null = null;
  transactions: Transaction[] = [];

  members: FamilyMember[] = [];
  selectedUserId: number | null = null;
  currentUserId: number | null = null;
  isAdmin = false;

  showForm = false;
  editingTransaction: Transaction | null = null;
  formType: 'INCOME' | 'EXPENSE' = 'EXPENSE';
  formAmount = 0;
  formCategory = '';
  formDescription = '';
  formDate = '';
  formError = '';

  months = MONTHS;
  expenseCategories = EXPENSE_CATEGORIES;
  incomeCategories = INCOME_CATEGORIES;

  /* Tabs */
  activeTab: Tab = 'dashboard';

  /* Reports */
  searchText = '';
  searchResults: Transaction[] = [];
  hasSearched = false;

  /* Objectives */
  objectives: Objective[] = [];
  showObjectiveForm = false;
  editingObjective: Objective | null = null;
  objType: string = 'MONTHLY_EXPENSE_LIMIT';
  objCategory = '';
  objTarget = 0;
  objError = '';

  objectiveTypes = [
    { value: 'MONTHLY_EXPENSE_LIMIT', label: 'Monthly Expense Limit' },
    { value: 'MONTHLY_SAVINGS_GOAL', label: 'Savings Goal' },
    { value: 'CATEGORY_LIMIT', label: 'Category Limit' },
  ];

  constructor(
    private moneyService: MoneyService,
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
        this.loadDashboard();
      }
    });
  }

  /* ── Tab switching ── */

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'dashboard') this.loadDashboard();
    if (tab === 'objectives') this.loadObjectives();
    if (tab === 'reports' && this.hasSearched) this.searchTransactions();
  }

  get isViewingOwn(): boolean {
    return this.selectedUserId === this.currentUserId;
  }

  get selectedMember(): FamilyMember | undefined {
    return this.members.find(m => m.id === this.selectedUserId);
  }

  onUserChange(userId: number): void {
    this.selectedUserId = userId;
    if (this.activeTab === 'dashboard') this.loadDashboard();
    else if (this.activeTab === 'objectives') this.loadObjectives();
  }

  /* ── Dashboard ── */

  loadDashboard(): void {
    this.moneyService.getSummary(this.selectedYear, this.selectedMonth, this.selectedUserId ?? undefined).subscribe(s => {
      this.summary = s;
    });
    this.moneyService.getTransactions(this.selectedYear, this.selectedMonth, this.selectedUserId ?? undefined).subscribe(t => {
      this.transactions = t;
    });
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) { this.selectedMonth = 12; this.selectedYear--; }
    else { this.selectedMonth--; }
    this.loadData();
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) { this.selectedMonth = 1; this.selectedYear++; }
    else { this.selectedMonth++; }
    this.loadData();
  }

  private loadData(): void {
    if (this.activeTab === 'dashboard') this.loadDashboard();
    else if (this.activeTab === 'objectives') this.loadObjectives();
  }

  maxCategoryAmount(categories: { amount: number }[]): number {
    return Math.max(...categories.map(c => c.amount), 1);
  }

  totalTransactions(): number {
    return this.transactions.length;
  }

  /* ── Transaction CRUD ── */

  openAddForm(type: 'INCOME' | 'EXPENSE'): void {
    this.editingTransaction = null;
    this.formType = type;
    this.formAmount = 0;
    this.formCategory = '';
    this.formDescription = '';
    this.formDate = this.toLocalDate(this.now);
    this.formError = '';
    this.showForm = true;
  }

  openEditForm(t: Transaction): void {
    this.editingTransaction = t;
    this.formType = t.type;
    this.formAmount = t.amount;
    this.formCategory = t.category;
    this.formDescription = t.description || '';
    this.formDate = t.date;
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingTransaction = null;
  }

  submitForm(): void {
    this.formError = '';
    if (!this.formAmount || this.formAmount <= 0) { this.formError = 'Amount must be positive'; return; }
    if (!this.formCategory) { this.formError = 'Category is required'; return; }

    const data: any = {
      type: this.formType,
      amount: this.formAmount,
      category: this.formCategory,
      description: this.formDescription,
      date: this.formDate,
    };

    if (this.editingTransaction) {
      this.moneyService.updateTransaction(this.editingTransaction.id, data).subscribe({
        next: () => { this.closeForm(); this.loadDashboard(); },
        error: err => this.formError = err.error?.error || 'Failed to update',
      });
    } else {
      this.moneyService.createTransaction(data).subscribe({
        next: () => { this.closeForm(); this.loadDashboard(); },
        error: err => this.formError = err.error?.error || 'Failed to create',
      });
    }
  }

  deleteTransaction(t: Transaction): void {
    if (!confirm(`Delete this ${t.type.toLowerCase()} of $${t.amount.toFixed(2)}?`)) return;
    this.moneyService.deleteTransaction(t.id).subscribe(() => {
      this.loadDashboard();
    });
  }

  /* ── Reports ── */

  searchTransactions(): void {
    this.hasSearched = true;
    this.moneyService.getTransactions(undefined, undefined, this.selectedUserId ?? undefined, this.searchText || undefined)
      .subscribe(t => this.searchResults = t);
  }

  /* ── Objectives ── */

  loadObjectives(): void {
    this.moneyService.getObjectives(this.selectedMonth, this.selectedYear, this.selectedUserId ?? undefined)
      .subscribe(obj => this.objectives = obj);
  }

  openAddObjective(): void {
    this.editingObjective = null;
    this.objType = 'MONTHLY_EXPENSE_LIMIT';
    this.objCategory = '';
    this.objTarget = 0;
    this.objError = '';
    this.showObjectiveForm = true;
  }

  openEditObjective(obj: Objective): void {
    this.editingObjective = obj;
    this.objType = obj.type;
    this.objCategory = obj.category || '';
    this.objTarget = obj.targetAmount;
    this.objError = '';
    this.showObjectiveForm = true;
  }

  closeObjectiveForm(): void {
    this.showObjectiveForm = false;
    this.editingObjective = null;
  }

  objectiveCategoryRequired(): boolean {
    return this.objType === 'CATEGORY_LIMIT';
  }

  submitObjective(): void {
    this.objError = '';
    if (!this.objTarget || this.objTarget <= 0) { this.objError = 'Target amount must be positive'; return; }
    if (this.objType === 'CATEGORY_LIMIT' && !this.objCategory) { this.objError = 'Category is required for category limits'; return; }

    const data: CreateObjectiveRequest = {
      type: this.objType,
      category: this.objCategory || undefined,
      targetAmount: this.objTarget,
      month: this.selectedMonth,
      year: this.selectedYear,
    };

    if (this.editingObjective) {
      this.moneyService.updateObjective(this.editingObjective.id, data).subscribe({
        next: () => { this.closeObjectiveForm(); this.loadObjectives(); },
        error: err => this.objError = err.error?.error || 'Failed to update',
      });
    } else {
      this.moneyService.createObjective(data).subscribe({
        next: () => { this.closeObjectiveForm(); this.loadObjectives(); },
        error: err => this.objError = err.error?.error || 'Failed to create',
      });
    }
  }

  deleteObjective(obj: Objective): void {
    if (!confirm(`Delete objective "${this.objectiveLabel(obj)}"?`)) return;
    this.moneyService.deleteObjective(obj.id).subscribe(() => this.loadObjectives());
  }

  objectiveLabel(obj: Objective): string {
    const t = this.objectiveTypes.find(ot => ot.value === obj.type);
    const cat = obj.category ? ` (${obj.category})` : '';
    return `${t?.label || obj.type}${cat}`;
  }

  objectiveProgress(obj: Objective): number {
    if (obj.targetAmount <= 0) return 0;
    return Math.min(Math.round((obj.currentAmount / obj.targetAmount) * 100), 100);
  }

  objectivesByType(type: string): Objective[] {
    return this.objectives.filter(o => o.type === type);
  }

  objectiveStatus(obj: Objective): 'good' | 'warning' | 'danger' {
    if (obj.type === 'MONTHLY_SAVINGS_GOAL') {
      if (obj.currentAmount >= obj.targetAmount) return 'good';
      if (obj.currentAmount >= obj.targetAmount * 0.5) return 'warning';
      return 'danger';
    }
    const pct = obj.currentAmount / obj.targetAmount;
    if (pct <= 0.6) return 'good';
    if (pct <= 0.85) return 'warning';
    return 'danger';
  }

  objectiveRemaining(obj: Objective): number {
    if (obj.type === 'MONTHLY_SAVINGS_GOAL') {
      return Math.max(obj.targetAmount - obj.currentAmount, 0);
    }
    return Math.max(obj.targetAmount - obj.currentAmount, 0);
  }

  /* ── Reports computation ── */

  reportsIncome(): number {
    return this.searchResults.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  }

  reportsExpense(): number {
    return this.searchResults.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  }

  private groupByCategory(type: 'INCOME' | 'EXPENSE'): { category: string; amount: number }[] {
    const map = new Map<string, number>();
    for (const t of this.searchResults) {
      if (t.type !== type) continue;
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  reportsIncomeCategories(): { category: string; amount: number }[] {
    return this.groupByCategory('INCOME');
  }

  reportsExpenseCategories(): { category: string; amount: number }[] {
    return this.groupByCategory('EXPENSE');
  }

  reportsMaxIncome(): number {
    const cats = this.reportsIncomeCategories();
    return Math.max(...cats.map(c => c.amount), 1);
  }

  reportsMaxExpense(): number {
    const cats = this.reportsExpenseCategories();
    return Math.max(...cats.map(c => c.amount), 1);
  }

  /* ── Utils ── */

  private toLocalDate(d: Date): string {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  protected readonly Math = Math;
}
