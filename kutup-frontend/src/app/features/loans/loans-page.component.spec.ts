import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansPageComponent } from './loans-page.component';

describe('LoansPageComponent', () => {
  let component: LoansPageComponent;
  let fixture: ComponentFixture<LoansPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoansPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoansPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
