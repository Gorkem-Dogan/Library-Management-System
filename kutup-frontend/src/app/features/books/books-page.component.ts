// File: src/app/features/books/books-page.component.ts
// Change: Convert table layout into a two-column layout with a filter sidebar (left)
// and a card-style results list with covers (right). Keeps existing create/edit/delete logic.

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BooksService } from '../../core/services/books.service';
import { BookResponse, CreateBookRequest, UpdateBookRequest } from '../../core/models/book.model';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputNumberModule } from 'primeng/inputnumber';

// NOTE: We no longer render the big p-table; we show cards instead.

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ButtonModule, DialogModule, InputTextModule, DropdownModule,
    ToolbarModule, ToastModule, ConfirmDialogModule,
    ProgressSpinnerModule, InputNumberModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="themed-page books-layout">
      <!-- Left sidebar -->
      <aside class="books-sidebar panel">
        <h3 class="panel-title" style="margin-bottom: 12px;">Search</h3>

        <div class="form-grid">
          <div>
            <label>Title</label>
            <input pInputText [(ngModel)]="search.title" placeholder="e.g. The Hobbit" />
          </div>
          <div>
            <label>Author</label>
            <input pInputText [(ngModel)]="search.author" placeholder="e.g. Tolkien" />
          </div>
          <div>
            <label>Genre</label>
            <input pInputText [(ngModel)]="search.genre" placeholder="e.g. FANTASY" />
          </div>
          <div>
            <label>ISBN</label>
            <input pInputText [(ngModel)]="search.isbn" placeholder="e.g. 978..." />
          </div>
        </div>

        <div style="display:flex; gap:8px; margin-top:12px;">
          <button pButton label="Search" icon="pi pi-search" (click)="doSearch()"></button>
          <button pButton label="Clear" icon="pi pi-times" severity="secondary" (click)="clearSearch()"></button>
        </div>

        <div style="height: 1px; background: var(--border); margin: 16px 0;"></div>

        <div style="display:flex; gap:8px;">
          <button pButton label="New Book" icon="pi pi-plus" (click)="openCreate()"></button>
          <button pButton label="Reload" icon="pi pi-refresh" severity="secondary" (click)="reload()"></button>
        </div>
      </aside>

      <!-- Content area -->
      <section class="books-results">
        <div class="books-results-header">
          <h2 class="section-title" style="margin: 0;">Library Catalogue</h2>
          <span class="muted">{{ books().length }} results</span>
        </div>

        <div class="books-grid" [class.loading]="loading()">
          <div *ngIf="loading()" class="books-loading">
            <p-progressSpinner styleClass="w-3rem h-3rem"></p-progressSpinner>
          </div>

          <ng-container *ngIf="!loading() && books().length === 0">
            <div class="panel" style="text-align:center;">
              <div class="muted">No books found. Try adjusting your search.</div>
            </div>
          </ng-container>

          <article class="book-card panel" *ngFor="let row of books()">
            <div class="book-cover">
              <!-- You can swap src binding to whatever cover URL you add later -->
              <img [src]="coverFor(row)" [alt]="row.title" />
            </div>
            <div class="book-info">
              <a class="book-title" title="{{ row.title }}">{{ row.title }}</a>
              <div class="book-meta">
                <span class="meta-item">{{ row.author }}</span>
                <span class="sep">•</span>
                <span class="meta-item">{{ row.genre }}</span>
                <span class="sep">•</span>
                <span class="meta-item">{{ row.publicationYear || '—' }}</span>
                <span class="sep">•</span>
                <span class="meta-item">ISBN: {{ row.isbn || '—' }}</span>
              </div>
              <div class="book-desc" *ngIf="row.description">{{ row.description }}</div>

              <div class="book-stats">
                <span class="badge">Shelf: {{ row.shelfLocation }}</span>
                <span class="badge">Copies: {{ row.numberOfCopies }}</span>
                <span class="badge" [class.badge-ok]="row.availableCopies > 0" [class.badge-warn]="row.availableCopies === 0">
                  Available: {{ row.availableCopies }}
                </span>
              </div>

              <div class="book-actions">
                <button pButton icon="pi pi-pencil" label="Edit" size="small" (click)="openEdit(row)"></button>
                <button pButton icon="pi pi-trash" label="Delete" size="small" severity="danger" (click)="confirmDelete(row)"></button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Create/Edit dialog (unchanged) -->
    <p-dialog
      header="{{ dialogMode === 'create' ? 'New Book' : 'Edit Book' }}"
      [(visible)]="dialogVisible"
      [modal]="true" [style]="{ width: '700px' }" [draggable]="false"
    >
      <form [formGroup]="form" class="grid p-fluid">
        <div class="col-12 md:col-6">
          <label>Title</label>
          <input pInputText formControlName="title" />
        </div>
        <div class="col-12 md:col-6">
          <label>Author</label>
          <input pInputText formControlName="author" />
        </div>

        <div class="col-12 md:col-6">
          <label>Genre</label>
          <input pInputText formControlName="genre" placeholder="e.g. FICTION" />
        </div>
        <div class="col-12 md:col-6">
          <label>ISBN</label>
          <input pInputText formControlName="isbn" />
        </div>

        <div class="col-12">
          <label>Description</label>
          <textarea pInputText formControlName="description" rows="3"></textarea>
        </div>

        <div class="col-12 md:col-6">
          <label>Shelf Location</label>
          <input pInputText formControlName="shelfLocation" />
        </div>
        <div class="col-6 md:col-3">
          <label>Number of Copies</label>
          <p-inputNumber formControlName="numberOfCopies" [useGrouping]="false" [min]="0"></p-inputNumber>
        </div>
        <div class="col-6 md:col-3">
          <label>Available Copies</label>
          <p-inputNumber formControlName="availableCopies" [useGrouping]="false" [min]="0"></p-inputNumber>
        </div>

        <div class="col-12 md:col-6">
          <label>Publication Year</label>
          <input pInputText formControlName="publicationYear" placeholder="e.g. 2020" />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button pButton label="Cancel" severity="secondary" (click)="dialogVisible=false"></button>
        <button pButton label="Save" (click)="save()" [disabled]="form.invalid"></button>
      </ng-template>
    </p-dialog>
  `
})
export class BooksPageComponent implements OnInit {
  books = signal<BookResponse[]>([]);
  loading = signal<boolean>(false);

  dialogVisible = false;
  dialogMode: 'create' | 'edit' = 'create';
  selectedId: string | null = null;

  // Sidebar search model (uses backend priority rules: title > author > genre > isbn)
  search = { title: '', author: '', genre: '', isbn: '' };

  form!: import("@angular/forms").FormGroup;

  constructor(
    private fb: FormBuilder,
    private booksService: BooksService,
    private messages: MessageService,
    private confirm: ConfirmationService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      author: ['', [Validators.required, Validators.minLength(1)]],
      genre: ['', [Validators.required, Validators.minLength(1)]],
      isbn: [''],
      description: [''],
      shelfLocation: ['', [Validators.required]],
      numberOfCopies: [0, [Validators.required, Validators.min(0)]],
      availableCopies: [0, [Validators.required, Validators.min(0)]],
      publicationYear: [''],
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  coverFor(row: BookResponse): string {
    // Placeholder: you can change to your real cover path later
    // e.g. `/images/covers/${row.id}.jpg` or row.coverUrl if you add it to DTO
    return `/images/covers/${row.id}.jpg`;
  }

  reload(): void {
    this.loading.set(true);
    this.booksService.getAll().subscribe({
      next: data => {
        this.books.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load books' });
        console.error(err);
      }
    });
  }

  doSearch(): void {
    const { title, author, genre, isbn } = this.search;
    if (!title && !author && !genre && !isbn) {
      this.reload();
      return;
    }
    this.loading.set(true);
    this.booksService.search({ title, author, genre, isbn }).subscribe({
      next: data => {
        this.books.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Search failed', detail: this.extractError(err) });
      }
    });
  }

  clearSearch(): void {
    this.search = { title: '', author: '', genre: '', isbn: '' };
    this.reload();
  }

  openCreate(): void {
    this.dialogMode = 'create';
    this.selectedId = null;
    this.form.reset({
      title: '',
      author: '',
      genre: '',
      isbn: '',
      description: '',
      shelfLocation: '',
      numberOfCopies: 0,
      availableCopies: 0,
      publicationYear: '',
    });
    this.dialogVisible = true;
  }

  openEdit(row: BookResponse): void {
    this.dialogMode = 'edit';
    this.selectedId = row.id;
    this.form.reset({
      title: row.title,
      author: row.author,
      genre: row.genre,
      isbn: row.isbn ?? '',
      description: row.description ?? '',
      shelfLocation: row.shelfLocation,
      numberOfCopies: row.numberOfCopies,
      availableCopies: row.availableCopies,
      publicationYear: row.publicationYear ?? '',
    });
    this.dialogVisible = true;
  }

  save(): void {
    const numberOfCopies = this.form.value.numberOfCopies ?? 0;
    const availableCopies = this.form.value.availableCopies ?? 0;
    if (availableCopies > numberOfCopies) {
      this.messages.add({ severity: 'warn', summary: 'Validation', detail: 'Available copies cannot exceed total copies' });
      return;
    }

    const payloadBase = {
      isbn: this.form.value.isbn || null,
      title: this.form.value.title!,
      author: this.form.value.author!,
      genre: (this.form.value.genre || '').toString().toUpperCase(),
      description: this.form.value.description || null,
      shelfLocation: this.form.value.shelfLocation!,
      numberOfCopies: numberOfCopies,
      availableCopies: availableCopies,
      publicationYear: this.form.value.publicationYear || null
    };

    if (this.dialogMode === 'create') {
      const payload: CreateBookRequest = payloadBase;
      this.booksService.create(payload).subscribe({
        next: res => {
          this.messages.add({ severity: 'success', summary: 'Created', detail: `Book "${res.title}" created` });
          this.dialogVisible = false;
          this.reload();
        },
        error: err => {
          this.messages.add({ severity: 'error', summary: 'Create failed', detail: this.extractError(err) });
        }
      });
    } else if (this.dialogMode === 'edit' && this.selectedId) {
      const payload: UpdateBookRequest = payloadBase;
      this.booksService.update(this.selectedId, payload).subscribe({
        next: res => {
          this.messages.add({ severity: 'success', summary: 'Updated', detail: `Book "${res.title}" updated` });
          this.dialogVisible = false;
          this.reload();
        },
        error: err => {
          this.messages.add({ severity: 'error', summary: 'Update failed', detail: this.extractError(err) });
        }
      });
    }
  }

  confirmDelete(row: BookResponse): void {
    this.confirm.confirm({
      header: 'Confirm Delete',
      message: `Delete book "${row.title}"?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(row.id)
    });
  }

  delete(id: string): void {
    this.booksService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Book deleted' });
        this.reload();
      },
      error: err => {
        this.messages.add({ severity: 'error', summary: 'Delete failed', detail: this.extractError(err) });
      }
    });
  }

  extractError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string') return err.error;
    return 'Unexpected error';
  }
}
