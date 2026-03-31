import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmComponent } from './farm';

describe('FarmComponent', () => {
  let component: FarmComponent;
  let fixture: ComponentFixture<FarmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
