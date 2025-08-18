// TypeScript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { Observable } from 'rxjs';
import { BookResponse, CreateBookRequest, UpdateBookRequest } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/books`;

  getAll(): Observable<BookResponse[]> {
    return this.http.get<BookResponse[]>(this.baseUrl);
  }

  getById(id: string): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateBookRequest): Observable<BookResponse> {
    return this.http.post<BookResponse>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateBookRequest): Observable<BookResponse> {
    return this.http.put<BookResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  search(opts: { title?: string; author?: string; genre?: string; isbn?: string }): Observable<BookResponse[]> {
    let params = new HttpParams();
    if (opts.title) params = params.set('title', opts.title);
    else if (opts.author) params = params.set('author', opts.author);
    else if (opts.genre) params = params.set('genre', opts.genre);
    else if (opts.isbn) params = params.set('isbn', opts.isbn);

    return this.http.get<BookResponse[]>(`${this.baseUrl}/search`, { params });
  }
}
