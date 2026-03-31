import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { FarmComponent } from './farm';
import { FarmService } from '../services/farm';
import { Farm } from '../model/farm';

describe('FarmComponent', () => {
  let component: FarmComponent;
  let fixture: ComponentFixture<FarmComponent>;
  let farmsResponse$: Subject<Farm[]>;

  beforeEach(async () => {
    farmsResponse$ = new Subject<Farm[]>();

    await TestBed.configureTestingModule({
      imports: [FarmComponent],
      providers: [
        {
          provide: FarmService,
          useValue: {
            getAllFarms: () => farmsResponse$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
