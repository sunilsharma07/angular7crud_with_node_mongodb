import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from '@angular/common';
import { HttpClientModule} from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { PuzzlecategoryComponent } from './puzzlecategory.component';
// import {PuzzlecatepopupComponent} from './puzzlecatepopup/puzzlecatepopup.component';

import { PuzzlecategoryRoutingModule } from './puzzlecategory-routing.module'; 



const routes: Routes = [
  {
    path: '',
    component: PuzzlecategoryComponent,
    data: { 'title': 'Email Inbox' }
  }
];

@NgModule({
  imports: [
    FormsModule,
    DataTablesModule,
    HttpClientModule,
    PuzzlecategoryRoutingModule,
    CommonModule,
    PaginationModule.forRoot(),
    SweetAlert2Module.forRoot(
      {
        buttonsStyling: false,
        customClass: 'modal-content',
        confirmButtonClass: 'btn btn-primary',
        cancelButtonClass: 'btn'
    }),
    RouterModule.forChild(routes)
  ],
  declarations: [ PuzzlecategoryComponent ],
  // entryComponents: [PuzzlecatepopupComponent],
  exports: [RouterModule]
})
export class PuzzlecategoryModule { }
