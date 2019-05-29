import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { StudentComponent } from './student.component';

const routes: Routes = [
  {
    path: '',
    component: StudentComponent,
    data: {
      title: 'student'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule {}
