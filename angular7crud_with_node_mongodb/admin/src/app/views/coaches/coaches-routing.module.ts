import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { CoachesComponent } from './coaches.component';
import { StudentListComponent } from './studentList.component';

const routes: Routes = [
  {
    path: '',
    component: CoachesComponent,
    data: {
      title: 'coaches'
    }
  },
  { path: 'studentList', component: StudentListComponent, data: {title: 'Student List'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoachesRoutingModule {}
