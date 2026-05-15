export interface Transaction {
  id: number;
  userId: number;
  username: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface CreateTransactionRequest {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  incomeByCategory: CategorySummary[];
  expenseByCategory: CategorySummary[];
}

export const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Utilities', 'Rent', 'Health',
  'Entertainment', 'Shopping', 'Education', 'Other',
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Gifts', 'Other',
];

export interface Objective {
  id: number;
  userId: number;
  username: string;
  category: string | null;
  type: 'MONTHLY_EXPENSE_LIMIT' | 'MONTHLY_SAVINGS_GOAL' | 'CATEGORY_LIMIT';
  targetAmount: number;
  currentAmount: number;
  month: number;
  year: number;
}

export interface CreateObjectiveRequest {
  category?: string;
  type: string;
  targetAmount: number;
  month: number;
  year: number;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
