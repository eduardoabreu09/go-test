import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHeader } from './form-header';

describe('FormHeader', () => {
  let component: FormHeader;
  let fixture: ComponentFixture<FormHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(FormHeader);
    fixture.componentRef.setInput('title', 'Title');
    fixture.componentRef.setInput('description', 'Description');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
