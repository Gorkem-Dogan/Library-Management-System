// File: src/app/features/auth/register.component.ts
// Ensures Miraak background via CSS var on the wrapper; themed panels preserved.

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="auth-hero" style="--auth-bg: url('/images/miraak.jpg')">
      <div style="max-width: 560px; margin: 40px auto;">
        <div class="panel">
          <h2 class="panel-title">Join the College</h2>
          <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
            <div>
              <label>Username</label>
              <input pInputText formControlName="username"/>
            </div>
            <div>
              <label>Password</label>
              <input pInputText type="password" formControlName="password"/>
            </div>
            <div>
              <label>Email</label>
              <input pInputText type="email" formControlName="email"/>
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
              <button pButton type="submit" label="Register" [disabled]="form.invalid || loading"></button>
            </div>
          </form>
        </div>

        <div class="panel" style="margin-top:16px;">
          <h3 class="panel-title" style="font-size:18px;">Resend Verification</h3>
          <form [formGroup]="resendForm" class="form-grid" (ngSubmit)="resend()">
            <div>
              <label>Email</label>
              <input pInputText type="email" placeholder="Email" formControlName="email"/>
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end;">
              <button pButton type="submit" label="Resend" [disabled]="resendForm.invalid || resendLoading"></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  loading = false;
  resendLoading = false;

  form!: import('@angular/forms').FormGroup;
  resendForm!: import('@angular/forms').FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private messages: MessageService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.register(this.form.value as any).subscribe({
      next: res => {
        this.loading = false;
        const msg = res?.message || 'Registered. Please verify your email.';
        this.messages.add({ severity: 'success', summary: 'Registered', detail: msg });
        this.router.navigateByUrl('/login');
      },
      error: err => {
        this.loading = false;
        const detail = err?.error?.message || 'Registration failed';
        this.messages.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }

  resend() {
    if (this.resendForm.invalid) return;
    this.resendLoading = true;
    this.auth.resendVerification(this.resendForm.value.email as string).subscribe({
      next: () => {
        this.resendLoading = false;
        this.messages.add({ severity: 'success', summary: 'Verification', detail: 'Verification email sent.' });
      },
      error: err => {
        this.resendLoading = false;
        const detail = err?.error || 'Resend failed';
        this.messages.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }
}
