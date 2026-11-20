import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiveDetails } from './dive-details';

describe('DiveDetails', () => {
  let component: DiveDetails;
  let fixture: ComponentFixture<DiveDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiveDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(DiveDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
