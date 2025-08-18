// File: src/app/features/auth/login.component.ts
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="auth-hero" style="--auth-bg: url('/images/miraak.jpg')">
      <div style="max-width: 520px; margin: 40px auto;">
        <div class="panel">
          <h2 class="panel-title">Dragonborn Login</h2>
          <form [formGroup]="form" class="form-grid" (ngSubmit)="submit()">
            <div>
              <label>Username</label>
              <input pInputText formControlName="username"/>
            </div>
            <div>
              <label>Password</label>
              <input pInputText type="password" formControlName="password"/>
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:8px;">
              <button pButton type="submit" label="Login" [disabled]="form.invalid || loading"></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loading = false;
  form!: import('@angular/forms').FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private messages: MessageService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value as any).subscribe({
      next: res => {
        this.auth.setSession(res);
        this.loading = false;
        this.messages.add({severity: 'success', summary: 'Logged in', detail: 'Welcome!'});
        this.router.navigateByUrl('/home');
      },
      error: err => {
        this.loading = false;
        const detail = err?.error?.message || 'Login failed';
        this.messages.add({severity: 'error', summary: 'Error', detail});
      }
    });
  }
}
