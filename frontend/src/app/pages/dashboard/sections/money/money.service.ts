import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Transaction, CreateTransactionRequest, TransactionSummary, Objective, CreateObjectiveRequest } from './money.models';

@Injectable({ providedIn: 'root' })
export class MoneyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTransactions(year?: number, month?: number, userId?: number, q?: string): Observable<Transaction[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);
    if (userId) params = params.set('userId', userId);
    if (q) params = params.set('q', q);
    return this.http.get<Transaction[]>(`${this.apiUrl}/money/transactions`, { params });
  }

  getSummary(year?: number, month?: number, userId?: number): Observable<TransactionSummary> {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (month) params = params.set('month', month);
    if (userId) params = params.set('userId', userId);
    return this.http.get<TransactionSummary>(`${this.apiUrl}/money/summary`, { params });
  }

  createTransaction(data: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/money/transactions`, data);
  }

  updateTransaction(id: number, data: CreateTransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/money/transactions/${id}`, data);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/money/transactions/${id}`);
  }

  getObjectives(month?: number, year?: number, userId?: number): Observable<Objective[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    if (userId) params = params.set('userId', userId);
    return this.http.get<Objective[]>(`${this.apiUrl}/money/objectives`, { params });
  }

  createObjective(data: CreateObjectiveRequest): Observable<Objective> {
    return this.http.post<Objective>(`${this.apiUrl}/money/objectives`, data);
  }

  updateObjective(id: number, data: CreateObjectiveRequest): Observable<Objective> {
    return this.http.put<Objective>(`${this.apiUrl}/money/objectives/${id}`, data);
  }

  deleteObjective(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/money/objectives/${id}`);
  }
}
