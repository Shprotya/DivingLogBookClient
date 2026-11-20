import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiveForm } from './dive-form';

describe('DiveForm', () => {
  let component: DiveForm;
  let fixture: ComponentFixture<DiveForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiveForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DiveForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
