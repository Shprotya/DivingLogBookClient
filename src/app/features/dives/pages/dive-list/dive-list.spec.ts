import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiveList } from './dive-list';

describe('DiveList', () => {
  let component: DiveList;
  let fixture: ComponentFixture<DiveList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiveList],
    }).compileComponents();

    fixture = TestBed.createComponent(DiveList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
