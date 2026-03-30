import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Firmware } from './firmware';

describe('Firmware', () => {
  let component: Firmware;
  let fixture: ComponentFixture<Firmware>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Firmware],
    }).compileComponents();

    fixture = TestBed.createComponent(Firmware);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
