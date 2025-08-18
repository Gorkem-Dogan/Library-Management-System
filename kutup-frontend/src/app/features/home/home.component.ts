import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" style="padding: 12px 16px; display: flex; justify-content: flex-start;">
      <a *ngIf="isLoggedIn()" class="btn primary btn-lg" routerLink="/loans">My Books</a>
    </div>

    <!-- Parallax hero -->
    <section class="parallax-hero">
      <div class="hero-layer bg"></div>
      <div class="hero-layer mid"></div>
      <div class="hero-layer fg"></div>
      <div class="parallax-veil"></div>

      <div class="hero-content">
        <div>
          <h1>Welcome to the Skyrim Library</h1>
          <p>Browse ancient tomes and legendary works. No account required.</p>
          <div class="hero-actions">
            <a class="btn primary btn-lg" routerLink="/books">Browse Books</a>
            <a class="btn ghost btn-lg" routerLink="/login" *ngIf="!isLoggedIn()">Login</a>
            <a class="btn ghost btn-lg" routerLink="/register" *ngIf="!isLoggedIn()">Register</a>
          </div>
        </div>
      </div>
    </section>

    <section class="container" style="padding: 24px 16px;">
      <h2 class="section-title" style="margin-top:0;">Featured</h2>
      <p class="muted">Discover our collection by heading to Books. Create an account to loan and manage your books.</p>
    </section>
  `
})
export class HomeComponent {
  private auth = inject(AuthService);

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  // Parallax init
  constructor() {
    queueMicrotask(() => this.initParallax());
  }

  private initParallax(): void {
    const bg = document.querySelector<HTMLElement>('.hero-layer.bg');
    const mid = document.querySelector<HTMLElement>('.hero-layer.mid');
    const fg = document.querySelector<HTMLElement>('.hero-layer.fg');
    if (!bg || !mid || !fg) return;

    let ticking = false;
    let lastY = 0;

    const onScroll = () => {
      lastY = window.scrollY || 0;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const y = lastY;
          bg.style.transform = `translate3d(0, ${y * 0.2}px, 0)`;
          mid.style.transform = `translate3d(0, ${y * 0.35}px, 0)`;
          fg.style.transform = `translate3d(0, ${y * 0.55}px, 0)`;
          ticking = false;
        });
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}
