import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MoneyService } from './money.service';
import { Transaction, TransactionSummary, EXPENSE_CATEGORIES, INCOME_CATEGORIES, MONTHS } from './money.models';

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

  constructor(
    private moneyService: MoneyService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.moneyService.getSummary(this.selectedYear, this.selectedMonth).subscribe(s => {
      this.summary = s;
    });
    this.moneyService.getTransactions(this.selectedYear, this.selectedMonth).subscribe(t => {
      this.transactions = t;
    });

  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadData();
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadData();
  }

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
    if (!this.formAmount || this.formAmount <= 0) {
      this.formError = 'Amount must be positive';
      return;
    }
    if (!this.formCategory) {
      this.formError = 'Category is required';
      return;
    }

    const data = {
      type: this.formType,
      amount: this.formAmount,
      category: this.formCategory,
      description: this.formDescription,
      date: this.formDate,
    };

    if (this.editingTransaction) {
      this.moneyService.updateTransaction(this.editingTransaction.id, data).subscribe({
        next: () => {
          this.closeForm();
          this.loadData();
        },
        error: err => this.formError = err.error?.error || 'Failed to update',
      });
    } else {
      this.moneyService.createTransaction(data).subscribe({
        next: () => {
          this.closeForm();
          this.loadData();
        },
        error: err => this.formError = err.error?.error || 'Failed to create',
      });
    }
  }

  deleteTransaction(t: Transaction): void {
    if (!confirm(`Delete this ${t.type.toLowerCase()} of $${t.amount.toFixed(2)}?`)) return;
    this.moneyService.deleteTransaction(t.id).subscribe(() => {
      this.loadData();
    });
  }

  maxCategoryAmount(categories: { amount: number }[]): number {
    return Math.max(...categories.map(c => c.amount), 1);
  }

  totalTransactions(): number {
    return this.transactions.length;
  }

  private toLocalDate(d: Date): string {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  protected readonly Math = Math;
}
