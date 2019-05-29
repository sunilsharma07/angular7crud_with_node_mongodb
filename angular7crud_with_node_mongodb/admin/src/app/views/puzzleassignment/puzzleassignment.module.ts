import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from '@angular/common';
import { HttpClientModule} from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
// Datepicker Module
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';


import { PuzzleassignmentComponent } from './puzzleassignment.component';
import { PuzzleassignmentRoutingModule } from './puzzleassignment-routing.module'; 


const routes: Routes = [
  {
    path: '',
    component: PuzzleassignmentComponent,
    data: { 'title': 'Email Inbox' }
  }
];

@NgModule({
  imports: [
    FormsModule,
    DataTablesModule,
    HttpClientModule,
    PuzzleassignmentRoutingModule,
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
  declarations: [ PuzzleassignmentComponent ],
  exports: [RouterModule]
})
export class PuzzleassignmentModule { }
