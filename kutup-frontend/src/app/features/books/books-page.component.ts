// File: src/app/features/books/books-page.component.ts
// Fix: Ensure this file exports a standalone Angular component (BooksPageComponent) so lazy loading can import it.

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BooksService } from '../../core/services/books.service';
import { BookResponse, CreateBookRequest, UpdateBookRequest } from '../../core/models/book.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule, InputTextarea,
    InputNumberModule, DropdownModule, ToolbarModule, ToastModule, ConfirmDialogModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="themed-page">
      <p-toolbar>
        <div class="p-toolbar-group-left flex gap-2">
          <button pButton label="New Book" icon="pi pi-plus" (click)="openCreate()"></button>
        </div>
        <div class="p-toolbar-group-right flex gap-2 align-items-center">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="search.title" placeholder="Search by title"/>
          </span>
          <input pInputText [(ngModel)]="search.author" placeholder="Author"/>
          <input pInputText [(ngModel)]="search.genre" placeholder="Genre"/>
          <input pInputText [(ngModel)]="search.isbn" placeholder="ISBN"/>
          <button pButton label="Search" icon="pi pi-filter" (click)="doSearch()"></button>
          <button pButton label="Clear" icon="pi pi-times" severity="secondary" (click)="clearSearch()"></button>
        </div>
      </p-toolbar>

      <h2 class="section-title">Library Catalogue</h2>

      <p-table
        [value]="books()"
        [paginator]="true"
        [rows]="10"
        dataKey="id"
        [loading]="loading()"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="title">Title <p-sortIcon field="title"></p-sortIcon></th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Shelf</th>
            <th># Copies</th>
            <th>Available</th>
            <th>Year</th>
            <th style="width: 240px;">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.title }}</td>
            <td>{{ row.author }}</td>
            <td>{{ row.genre }}</td>
            <td>{{ row.isbn || '-' }}</td>
            <td>{{ row.shelfLocation }}</td>
            <td>{{ row.numberOfCopies }}</td>
            <td>{{ row.availableCopies }}</td>
            <td>{{ row.publicationYear || '-' }}</td>
            <td class="flex gap-2">
              <button pButton icon="pi pi-pencil" size="small" label="Edit" (click)="openEdit(row)"></button>
              <button pButton icon="pi pi-trash" size="small" severity="danger" label="Delete" (click)="confirmDelete(row)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

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
            <textarea pInputTextarea formControlName="description" rows="3"></textarea>
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
    </div>
  `
})
export class BooksPageComponent implements OnInit {
  books = signal<BookResponse[]>([]);
  loading = signal<boolean>(false);

  dialogVisible = false;
  dialogMode: 'create' | 'edit' = 'create';
  selectedId: string | null = null;

  // simple search model
  search = { title: '', author: '', genre: '', isbn: '' };

  form!: import('@angular/forms').FormGroup;

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

  reload(): void {
    this.loading.set(true);
    this.booksService.getAll().subscribe({
      next: data => {
        this.books.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Error', detail: 'Failed to load books' });
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
        const detail = this.extractError(err);
        this.messages.add({ severity: 'error', summary: 'Search failed', detail });
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
    const payloadBase = {
      isbn: this.form.value.isbn || null,
      title: this.form.value.title!,
      author: this.form.value.author!,
      genre: (this.form.value.genre || '').toString().toUpperCase(),
      description: this.form.value.description || null,
      shelfLocation: this.form.value.shelfLocation!,
      numberOfCopies: this.form.value.numberOfCopies ?? 0,
      availableCopies: this.form.value.availableCopies ?? 0,
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
