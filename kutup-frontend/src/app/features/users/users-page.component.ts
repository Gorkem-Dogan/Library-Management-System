// File: src/app/features/users/users-page.component.ts
// Theme: Skyrim styles (themed-page + section-title), full standalone component.

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../../core/models/user.model';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    DropdownModule, ToggleButtonModule, ToolbarModule, ToastModule,
    ConfirmDialogModule, PasswordModule, ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="themed-page">
      <p-toolbar>
        <div class="p-toolbar-group-left flex gap-2">
          <button pButton label="New User" icon="pi pi-user-plus" (click)="openCreate()"></button>
        </div>
      </p-toolbar>

      <h2 class="section-title">Adventurers Registry</h2>

      <p-table
        [value]="users()"
        [paginator]="true"
        [rows]="10"
        dataKey="id"
        [loading]="loading()"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>First</th>
            <th>Last</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th style="width: 220px;">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.firstName }}</td>
            <td>{{ row.lastName }}</td>
            <td>{{ row.email }}</td>
            <td>{{ row.role }}</td>
            <td>
              <span class="pi" [ngClass]="row.active ? 'pi-check-circle text-green-600' : 'pi-times-circle text-red-500'"></span>
            </td>
            <td class="flex gap-2">
              <button pButton icon="pi pi-pencil" size="small" label="Edit" (click)="openEdit(row)"></button>
              <button pButton icon="pi pi-trash" size="small" severity="danger" label="Delete" (click)="confirmDelete(row)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog
        header="{{ dialogMode === 'create' ? 'New User' : 'Edit User' }}"
        [(visible)]="dialogVisible"
        [modal]="true" [style]="{ width: '680px' }" [draggable]="false"
      >
        <form [formGroup]="form" class="grid p-fluid">
          <div class="col-12 md:col-6">
            <label>First Name</label>
            <input pInputText formControlName="firstName" />
          </div>
          <div class="col-12 md:col-6">
            <label>Last Name</label>
            <input pInputText formControlName="lastName" />
          </div>

          <div class="col-12 md:col-6">
            <label>Email</label>
            <input pInputText type="email" formControlName="email" />
          </div>
          <div class="col-12 md:col-6">
            <label>Role</label>
            <input pInputText formControlName="role" placeholder="e.g. USER or ADMIN" />
          </div>

          <div class="col-12 md:col-6">
            <label>Username</label>
            <input pInputText formControlName="username" />
          </div>
          <div class="col-12 md:col-6" *ngIf="dialogMode === 'create'">
            <label>Password</label>
            <p-password [feedback]="false" formControlName="password" toggleMask="true"></p-password>
          </div>

          <div class="col-12">
            <label>Active</label>
            <p-toggleButton
              onLabel="Active" offLabel="Inactive"
              onIcon="pi pi-check" offIcon="pi pi-times"
              formControlName="active">
            </p-toggleButton>
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
export class UsersPageComponent implements OnInit {
  users = signal<UserResponse[]>([]);
  loading = signal<boolean>(false);

  dialogVisible = false;
  dialogMode: 'create' | 'edit' = 'create';
  selectedId: string | null = null;

  form!: import('@angular/forms').FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private messages: MessageService,
    private confirm: ConfirmationService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', [Validators.required]],
      username: [''],
      password: [''],
      active: [true, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.usersService.getAll().subscribe({
      next: data => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.messages.add({ severity: 'error', summary: 'Error', detail: this.extractError(err, 'Failed to load users') });
      }
    });
  }

  openCreate(): void {
    this.dialogMode = 'create';
    this.selectedId = null;
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      role: 'USER',
      username: '',
      password: '',
      active: true,
    });
    this.dialogVisible = true;
  }

  openEdit(row: UserResponse): void {
    this.dialogMode = 'edit';
    this.selectedId = row.id;
    this.form.reset({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      role: row.role,
      username: '',
      password: '',
      active: row.active,
    });
    this.dialogVisible = true;
  }

  save(): void {
    const roleValue = (this.form.value.role || '').toString().toUpperCase();

    if (this.dialogMode === 'create') {
      const payload: CreateUserRequest = {
        username: this.form.value.username || '',
        password: this.form.value.password || '',
        email: this.form.value.email!,
        firstName: this.form.value.firstName!,
        lastName: this.form.value.lastName!,
        role: roleValue,
        active: !!this.form.value.active,
      };
      this.usersService.create(payload).subscribe({
        next: res => {
          this.messages.add({ severity: 'success', summary: 'Created', detail: `User "${res.email}" created` });
          this.dialogVisible = false;
          this.reload();
        },
        error: err => {
          this.messages.add({ severity: 'error', summary: 'Create failed', detail: this.extractError(err) });
        }
      });
    } else if (this.dialogMode === 'edit' && this.selectedId) {
      const payload: UpdateUserRequest = {
        username: this.form.value.username || null,
        password: this.form.value.password || null,
        email: this.form.value.email || null,
        firstName: this.form.value.firstName || null,
        lastName: this.form.value.lastName || null,
        role: roleValue || null,
        active: !!this.form.value.active,
      };
      this.usersService.update(this.selectedId, payload).subscribe({
        next: res => {
          this.messages.add({ severity: 'success', summary: 'Updated', detail: `User "${res.email}" updated` });
          this.dialogVisible = false;
          this.reload();
        },
        error: err => {
          this.messages.add({ severity: 'error', summary: 'Update failed', detail: this.extractError(err) });
        }
      });
    }
  }

  confirmDelete(row: UserResponse): void {
    this.confirm.confirm({
      header: 'Confirm Delete',
      message: `Delete user "${row.email}"?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(row.id)
    });
  }

  delete(id: string): void {
    this.usersService.delete(id).subscribe({
      next: () => {
        this.messages.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted' });
        this.reload();
      },
      error: err => {
        this.messages.add({ severity: 'error', summary: 'Delete failed', detail: this.extractError(err) });
      }
    });
  }

  extractError(err: any, fallback = 'Unexpected error'): string {
    if (err?.error?.message) return err.error.message;
    if (typeof err?.error === 'string') return err.error;
    return fallback;
  }
}
