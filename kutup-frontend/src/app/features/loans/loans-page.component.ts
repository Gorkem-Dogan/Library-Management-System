// File: src/app/features/loans/loans-page.component.ts
// Theme: Skyrim styles (themed-page + section-title), plus 401 handling that redirects to /login.

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoansService } from '../../core/services/loans.service';
import { CreateLoanRequest, LoanResponse, LoanStatus, UpdateLoanRequest } from '../../core/models/loan.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

type StatusOption = { label: string; value: LoanStatus };

type FineVM = {
  loanId: string;
  userId: string;
  bookTitle: string;
  fineAmount: string;
  fineStatus: string;
};

@Component({
  selector: 'app-loans-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    DropdownModule, ToolbarModule, ToastModule, ConfirmDialogModule,
    CalendarModule, ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="themed-page">
      <p-toolbar>
        <div class="p-toolbar-group-left flex gap-2">
          <button pButton label="New Loan" icon="pi pi-plus" (click)="openCreate()"></button>
        </div>
        <div class="p-toolbar-group-right flex gap-2 align-items-center">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input pInputText [(ngModel)]="searchUsername" placeholder="Search by username"/>
          </span>
          <button pButton label="Search" icon="pi pi-filter" (click)="doSearch()"></button>
          <button pButton label="Clear" icon="pi pi-times" severity="secondary" (click)="clearSearch()"></button>
        </div>
      </p-toolbar>

      <h2 class="section-title">My Books</h2>

      <p-table
        [value]="loans()"
        [paginator]="true"
        [rows]="10"
        dataKey="id"
        [loading]="loading()"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Book</th>
            <th>Loan Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
            <th style="width: 320px;">Actions</th>
            <th style="width: 160px;">Fines</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.id }}</td>
            <td>{{ row.username || row.userId }}</td>
            <td>{{ row.bookTitle || row.bookId }}</td>
            <td>{{ row.loanDate }}</td>
            <td>{{ row.dueDate }}</td>
            <td>{{ row.returnDate || '-' }}</td>
            <td>
              <span
                class="pi"
                [ngClass]="{
                  'pi-check-circle text-green-600': row.status === 'RETURNED',
                  'pi-exclamation-circle text-orange-500': row.status === 'OVERDUE',
                  'pi-clock text-blue-500': row.status === 'ACTIVE'
                }"
                style="margin-right: 6px"
              ></span>
              {{ row.status }}
            </td>
            <td class="flex gap-2">
              <button pButton icon="pi pi-pencil" size="small" label="Edit" (click)="openEdit(row)"></button>
              <button pButton icon="pi pi-undo" size="small" severity="success" label="Return" (click)="markReturned(row)" [disabled]="row.status === 'RETURNED'"></button>
              <button pButton icon="pi pi-trash" size="small" severity="danger" label="Delete" (click)="confirmDelete(row)"></button>
            </td>
            <td>
              <button
                pButton
                size="small"
                [icon]="fineDialogVisible && finesForUser === (row.username || '') ? 'pi pi-eye-slash' : 'pi pi-eye'"
                [label]="fineDialogVisible && finesForUser === (row.username || '') ? 'Hide' : 'Show'"
                (click)="toggleFines(row)"
                [disabled]="!row.username"
              ></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog
        header="Fines"
        [(visible)]="fineDialogVisible"
        [modal]="true" [style]="{ width: '640px' }" [draggable]="false"
        (onHide)="closeFines()"
      >
        <div *ngIf="finesLoading" class="flex justify-content-center p-3">
          <p-progressSpinner styleClass="w-3rem h-3rem"></p-progressSpinner>
        </div>

        <div *ngIf="!finesLoading && fines.length === 0" class="p-2">
          No fines for user "{{ finesForUser }}".
        </div>

        <div *ngIf="!finesLoading && fines.length > 0" class="p-2">
          <table class="w-full" style="border-collapse: collapse;">
            <thead>
              <tr>
                <th class="text-left p-2">Loan ID</th>
                <th class="text-left p-2">Book</th>
                <th class="text-left p-2">Amount</th>
                <th class="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let f of fines">
                <td class="p-2">#{{ f.loanId }}</td>
                <td class="p-2">{{ f.bookTitle }}</td>
                <td class="p-2">₺{{ f.fineAmount }}</td>
                <td class="p-2">
                  <span class="pi"
                    [ngClass]="{
                      'pi-exclamation-circle text-orange-500': f.fineStatus === 'UNPAID',
                      'pi-check-circle text-green-600': f.fineStatus === 'PAID',
                      'pi-minus-circle text-blue-500': f.fineStatus === 'WAIVED'
                    }"
                    style="margin-right: 6px"
                  ></span>
                  {{ f.fineStatus }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template pTemplate="footer">
          <button pButton label="Close" (click)="closeFines()"></button>
        </ng-template>
      </p-dialog>

      <p-dialog
        header="{{ dialogMode === 'create' ? 'New Loan' : 'Edit Loan' }}"
        [(visible)]="dialogVisible"
        [modal]="true" [style]="{ width: '720px' }" [draggable]="false"
      >
        <form [formGroup]="form" class="grid p-fluid">
          <ng-container *ngIf="dialogMode === 'create'; else editFields">
            <div class="col-12 md:col-6">
              <label>User ID (UUID)</label>
              <input pInputText formControlName="userId" placeholder="User UUID"/>
            </div>
            <div class="col-12 md:col-6">
              <label>Book ID (UUID)</label>
              <input pInputText formControlName="bookId" placeholder="Book UUID"/>
            </div>
          </ng-container>

          <ng-template #editFields>
            <div class="col-12 md:col-6">
              <label>Due Date</label>
              <p-calendar formControlName="dueDate" dateFormat="yy-mm-dd" [showIcon]="true"></p-calendar>
            </div>
            <div class="col-12 md:col-6">
              <label>Status</label>
              <p-dropdown [options]="statusOptions" optionLabel="label" optionValue="value" formControlName="status"></p-dropdown>
            </div>
            <div class="col-12 md:col-6">
              <label>Loan Date</label>
              <p-calendar formControlName="loanDate" dateFormat="yy-mm-dd" [showIcon]="true"></p-calendar>
            </div>
            <div class="col-12 md:col-6">
              <label>Return Date</label>
              <p-calendar formControlName="returnDate" dateFormat="yy-mm-dd" [showIcon]="true" [disabled]="form.value.status === 'ACTIVE'"></p-calendar>
            </div>
            <div class="col-12 md:col-6">
              <label>User ID (UUID)</label>
              <input pInputText formControlName="userId" placeholder="User UUID"/>
            </div>
            <div class="col-12 md:col-6">
              <label>Book ID (UUID)</label>
              <input pInputText formControlName="bookId" placeholder="Book UUID"/>
            </div>
          </ng-template>
        </form>

        <ng-template pTemplate="footer">
          <button pButton label="Cancel" severity="secondary" (click)="dialogVisible=false"></button>
          <button pButton label="Save" (click)="save()" [disabled]="form.invalid"></button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class LoansPageComponent implements OnInit {
  loans = signal<LoanResponse[]>([]);
  loading = signal<boolean>(false);

  dialogVisible = false;
  dialogMode: 'create' | 'edit' = 'create';
  selectedId: number | null = null;

  searchUsername = '';

  statusOptions: StatusOption[] = [
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'OVERDUE', value: 'OVERDUE' },
    { label: 'RETURNED', value: 'RETURNED' }
  ];

  form!: import('@angular/forms').FormGroup;

  // Fines state
  fineDialogVisible = false;
  finesLoading = false;
  fines: FineVM[] = [];
  finesForUser = '';

  constructor(
    private fb: FormBuilder,
    private loansService: LoansService,
    private messages: MessageService,
    private confirm: ConfirmationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      userId: [''],
      bookId: [''],
      loanDate: [''],
      dueDate: [''],
      returnDate: [''],
      status: ['ACTIVE', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  private handleAuthError(err: any) {
    if (err?.status === 401) {
      this.messages.add({ severity: 'warn', summary: 'Session', detail: 'Please log in to view your loans.' });
      this.router.navigateByUrl('/login');
      return true;
    }
    return false;
  }

  reload(): void {
    this.loading.set(true);
    this.loansService.getAll().subscribe({
      next: data => {
        this.loans.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        if (!this.handleAuthError(err)) {
          this.messages.add({ severity: 'error', summary: 'Error', detail: this.extractError(err, 'Failed to load loans') });
        }
      }
    });
  }

  doSearch(): void {
    const username = this.searchUsername.trim();
    if (!username) {
      this.reload();
      return;
    }
    this.loading.set(true);
    this.loansService.getByUsername(username).subscribe({
      next: data => {
        this.loans.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        if (!this.handleAuthError(err)) {
          this.messages.add({ severity: 'error', summary: 'Search failed', detail: this.extractError(err) });
        }
      }
    });
  }

  clearSearch(): void {
    this.searchUsername = '';
    this.reload();
  }

  openCreate(): void {
    this.dialogMode = 'create';
    this.selectedId = null;
    this.form.reset({
      userId: '',
      bookId: '',
      loanDate: '',
      dueDate: '',
      returnDate: '',
      status: 'ACTIVE'
    });
    this.dialogVisible = true;
  }

  openEdit(row: LoanResponse): void {
    this.dialogMode = 'edit';
    this.selectedId = row.id;
    this.form.reset({
      userId: row.userId,
      bookId: row.bookId,
      loanDate: row.loanDate || '',
      dueDate: row.dueDate || '',
      returnDate: row.returnDate || '',
      status: row.status
    });
    this.dialogVisible = true;
  }

  save(): void {
    if (this.dialogMode === 'create') {
      const payload: CreateLoanRequest = {
        userId: this.form.value.userId!,
        bookId: this.form.value.bookId!,
      };
      if (!payload.userId || !payload.bookId) {
        this.messages.add({ severity: 'warn', summary: 'Validation', detail: 'User ID and Book ID are required' });
        return;
      }
      this.loansService.create(payload).subscribe({
        next: () => {
          this.messages.add({ severity: 'success', summary: 'Created', detail: 'Loan created' });
          this.dialogVisible = false;
          this.reload();
        },
        error: err => {
          if (!this.handleAuthError(err)) {
            this.messages.add({ severity: 'error', summary: 'Create failed', detail: this.extractError(err) });
          }
        }
      });
    } else if (this.dialogMode === 'edit' && this.selectedId != null) {
      const payload: UpdateLoanRequest = {
        userId: this.form.value.userId || null,
        bookId: this.form.value.bookId || null,
        loanDate: this.normalizeDate(this.form.value.loanDate),
        dueDate: this.normalizeDate(this.form.value.dueDate),
        returnDate: this.normalizeDate(this.form.value.returnDate),
        status: (this.form.value.status || '').toString().toUpperCase() as LoanStatus
      };
      this.loansService.update(this.selectedId, payload).subscribe({
        next: () => {
          this.messages.add({ severity: 'success', summary: 'Updated', detail: 'Loan updated' });
          this.dialogVisible = false;
          this.reload();
        },
        error: err => {
          if (!this.handleAuthError(err)) {
            this.messages.add({ severity: 'error', summary: 'Update failed', detail: this.extractError(err) });
          }
        }
      });
    }
  }

  markReturned(row: LoanResponse): void {
    this.loansService.returnLoan(row.id).subscribe({
      next: res => {
        this.messages.add({ severity: 'success', summary: 'Returned', detail: `Loan #${res.id} marked as returned` });
        this.reload();
      },
      error: err => {
        if (!this.handleAuthError(err)) {
          this.messages.add({ severity: 'error', summary: 'Return failed', detail: this.extractError(err) });
        }
      }
    });
  }

  confirmDelete(row: LoanResponse): void {
    this.confirm.confirm({
      header: 'Confirm Delete',
      message: `Delete loan #${row.id}?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(row.id)
    });
  }

  delete(id: number): void {
    this.loansService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'Loan deleted' });
        this.reload();
      },
      error: err => {
        if (!this.handleAuthError(err)) {
          this.messages.add({ severity: 'error', summary: 'Delete failed', detail: this.extractError(err) });
        }
      }
    });
  }

  toggleFines(row: LoanResponse): void {
    const username = (row.username || '').trim();
    if (!username) {
      this.messages.add({ severity: 'warn', summary: 'No username', detail: 'Username is missing for this row.' });
      return;
    }

    if (this.fineDialogVisible && this.finesForUser === username) {
      this.closeFines();
      return;
    }

    this.fineDialogVisible = true;
    this.finesForUser = username;
    this.finesLoading = true;
    this.fines = [];

    this.loansService.getFinesByUsername(username).subscribe({
      next: (data: any[]) => {
        this.fines = (data ?? []) as FineVM[];
        this.finesLoading = false;
      },
      error: err => {
        this.finesLoading = false;
        if (!this.handleAuthError(err)) {
          this.messages.add({ severity: 'error', summary: 'Fines', detail: this.extractError(err, 'Failed to load fines') });
        }
      }
    });
  }

  closeFines(): void {
    this.fineDialogVisible = false;
    this.finesLoading = false;
    this.fines = [];
    this.finesForUser = '';
  }

  normalizeDate(val: any): string | null {
    if (!val) return null;
    if (val instanceof Date) {
      const yyyy = val.getFullYear();
      const mm = String(val.getMonth() + 1).padStart(2, '0');
      const dd = String(val.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (typeof val === 'string') return val;
    return null;
  }

  extractError(err: any, fallback = 'Unexpected error'): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string') return err.error;
    return fallback;
  }
}
