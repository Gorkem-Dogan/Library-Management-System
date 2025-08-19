// File: src/app/features/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Fullscreen hero with background and a giant Elder Scroll centered -->
    <section class="parallax-hero">
      <div class="hero-layer bg"></div>
      <div class="hero-layer mid"></div>
      <div class="hero-layer fg"></div>
      <div class="parallax-veil"></div>

      <div class="hero-content">
        <div class="hero-center">
          <div class="scroll-stage">
            <img class="giant-scroll" src="/images/scroll-parchment.png" alt="Elder Scroll"/>
            <div class="scroll-caption">
              <div class="scroll-caption-title">Arcanaeum</div>
              <div class="scroll-caption-sub">A Skyrim themed library</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {}
