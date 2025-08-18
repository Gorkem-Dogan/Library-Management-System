// File: src/app/core/services/loans.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { Observable } from 'rxjs';
import { CreateLoanRequest, LoanResponse, UpdateLoanRequest } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoansService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/loans`;

  // Backend: GET /loans/username returns ALL loans (current mapping)
  getAll(): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>(`${this.baseUrl}/username`);
  }

  // Backend: GET /loans/id/{loanId}
  getById(id: number): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.baseUrl}/id/${id}`);
  }

  create(payload: CreateLoanRequest): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateLoanRequest): Observable<LoanResponse> {
    return this.http.put<LoanResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  returnLoan(id: number): Observable<LoanResponse> {
    return this.http.put<LoanResponse>(`${this.baseUrl}/${id}/return`, {});
  }

  // Backend: GET /loans/fines?username=... (returns LoanResponse list by username per current controller)
  getByUsername(username: string): Observable<LoanResponse[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<LoanResponse[]>(`${this.baseUrl}/fines`, { params });
  }

  // Backend: GET /loans/fine?username=... (returns FineResponse list)
  getFinesByUsername(username: string): Observable<any[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<any[]>(`${this.baseUrl}/fine`, { params });
  }
}
