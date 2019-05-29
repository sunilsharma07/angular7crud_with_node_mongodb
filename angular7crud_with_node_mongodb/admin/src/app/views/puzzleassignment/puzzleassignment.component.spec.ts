import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleassignmentComponent } from './puzzleassignment.component';

describe('PuzzleassignmentComponent', () => {
  let component: PuzzleassignmentComponent;
  let fixture: ComponentFixture<PuzzleassignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PuzzleassignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
