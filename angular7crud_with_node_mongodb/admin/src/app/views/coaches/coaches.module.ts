import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from '@angular/common';
import { HttpClientModule} from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';


import { PaginationModule } from 'ngx-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';


import { CoachesComponent } from './coaches.component';
import { CoachesRoutingModule } from './coaches-routing.module'; 
import { StudentListComponent } from './studentList.component';

const routes: Routes = [
  {
    path: '',
    component: CoachesComponent,
    data: { 'title': 'Email Inbox' }
  }
];


@NgModule({
  imports: [
    FormsModule,
    DataTablesModule,
    CoachesRoutingModule,
    CommonModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    SweetAlert2Module.forRoot(
      {
        buttonsStyling: false,
        customClass: 'modal-content',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn'
    }),
    RouterModule.forChild(routes) 
    
  ],
  declarations: [ 
    CoachesComponent,
    StudentListComponent
   ],
   exports: [RouterModule]
})
export class CoachesModule { }
