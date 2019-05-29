import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzlecategoryComponent } from './puzzlecategory.component';



describe('PuzzlecategoryComponent', () => {
  let component: PuzzlecategoryComponent;
  let fixture: ComponentFixture<PuzzlecategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PuzzlecategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzlecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
