import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinesPageComponent } from './fines-page.component';

describe('FinesPageComponent', () => {
  let component: FinesPageComponent;
  let fixture: ComponentFixture<FinesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinesPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
