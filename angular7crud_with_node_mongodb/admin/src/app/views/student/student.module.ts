import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from '@angular/common';

import { HttpClientModule} from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


import { StudentComponent } from './student.component';
import { StudentRoutingModule } from './student-routing.module'; 


const routes: Routes = [
  {
    path: '',
    component: StudentComponent,
    data: { 'title': 'Student Listing' }
  }
];


@NgModule({
  imports: [
    FormsModule,
    DataTablesModule,
    HttpClientModule,
    StudentRoutingModule,
    CommonModule,
    PaginationModule.forRoot(),
    SweetAlert2Module.forRoot(
      {
        buttonsStyling: false,
        customClass: 'modal-content',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn'
    }),
    
    
  ],
  declarations: [ StudentComponent ],
  exports: [RouterModule]
})
export class StudentModule { }
