import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PuzzlecategoryComponent } from './puzzlecategory.component';


const routes: Routes = [
  {
    path: '',
    component: PuzzlecategoryComponent,
    data: {
      title: 'student'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PuzzlecategoryRoutingModule {}


