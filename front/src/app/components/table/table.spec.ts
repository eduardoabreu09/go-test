import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Data, Table } from './table';

const tableData: Data = {
  title: 'GET /users',
  label: 'Users',
  headers: ['ID'],
  values: new Map([
    [
      1,
      [
        {
          value: '1',
          isDate: false,
        },
      ],
    ],
  ]),
};

describe('Table', () => {
  let component: Table;
  let fixture: ComponentFixture<Table>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Table],
    }).compileComponents();

    fixture = TestBed.createComponent(Table);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('error', '');
    fixture.componentRef.setInput('data', tableData);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
