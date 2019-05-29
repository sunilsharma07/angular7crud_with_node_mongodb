import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PuzzleassignmentComponent } from './puzzleassignment.component';

const routes: Routes = [
  {
    path: '',
    component: PuzzleassignmentComponent,
    data: {
      title: 'student'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PuzzleassignmentRoutingModule {}


