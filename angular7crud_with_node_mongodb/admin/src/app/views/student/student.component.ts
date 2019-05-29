import { Component, OnInit } from '@angular/core';
//import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';


import { StudentService } from '../../services/student.service';


class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {

    dtOptions: DataTables.Settings = {};    
    persons: any = [];
    m_persons: any = [];
    bsModalRef: BsModalRef;
    private subscriptions;
    subAdminList: any = [];

     /**************datatable related variable*****************************************/
     currentPage = 1;
     totalItem = 0;
     offset = 0;
     smallnumPages = 0;
     page: any = 1;
     limit = 10;
     sort_type: any;
     sort_field: any;
     showPagination: Boolean = false;
     isDataLoading: Boolean = false;
     isFilter: Boolean = false;
     params: any = {};
     categoriesList: any = [];
     resData: any;
     fieldNameUsed: any;
     order_type: any = 'asc';
     objectKeys = Object.keys;

  constructor(      
      private fb: FormBuilder,
      private router: Router,    
      private studentService: StudentService,
      private toastrService: ToastrService,
      private modalService: BsModalService,

) { }



  notuse_that_method()
  {
    const that = this;

      this.dtOptions = {
        pagingType: 'full_numbers',
        pageLength: 2,
        serverSide: true,
        processing: true,
        ajax: (dataTablesParameters: any, callback) => {
          that.studentService.getStudentList(dataTablesParameters)
            .subscribe(resp => {
              console.log('respresprespresp',resp.body['data']);
              let res = resp.body['data']
              that.persons = res.totalData;

              callback({
                recordsTotal: res.totalCount[0].count,
                recordsFiltered: res.totalCount[0].count,
                data: []
              });
            });
        },
        columns: [{ data: 'id' }, { data: 'first_name' }, { data: 'created_at' }, { data: 'uniqueId' }, { data: 'first_name' } ]
      };

  }

  ngOnInit(){

    this.getStudentlist_admin(this.offset, this.limit);
  }

  getStudentlist_admin(offset: number, limit: number, resetPagination: Boolean = false)
  {
      this.isDataLoading = true;
      let sort;
      if (this.sort_type) 
      {
        sort = { 'colId': this.sort_field, 'sort': this.sort_type };
      } 
      else 
      {
        sort = {};
      }

      let filter = {};

      if (this.isFilter) 
      {
        filter = Object.assign({}, this.params);
        
          if(this.params.date) 
          {
            const obj = {};
            filter['name'] = obj;
          }
      }


      this.studentService.getCategories(offset, limit, sort, filter).subscribe(response => 
        {
        this.isDataLoading = false;
        this.resData = response;
  
        if (response.status === 200) {
          this.categoriesList = this.resData.data.rows;
          for (let i = 0; i < this.categoriesList.length; i++) {
            const status = (this.categoriesList[i].status === 1) ? true : false;
            this.categoriesList[i].displayStatus = status;
          }
  
          if (this.offset === 0) {
            this.totalItem = this.resData.data.count;
          }
  
          this.showPagination = true;
          if (resetPagination) {
            this.currentPage = 1;
          }
        } else {
          this.toastrService.error('', this.resData.message);
        }
      }, err => {
        this.isDataLoading = false;
      });

  }


  // /* This function is call when page change*/
  pageChanged(event: any, resetPagination: Boolean = false): void 
  {
    this.page = event.page;
    this.offset = ((this.page - 1) * this.limit);
    this.getStudentlist_admin(this.offset, this.limit, resetPagination);
  }

    // /* This function is use for sorting */
    sorting() {
      if (this.totalItem > 10) {
        const event = { page: 1 };
        this.showPagination = false;
        this.pageChanged(event, true);
      }
    }


    resetFilter() {
      this.params = {};
      if (this.isFilter) {
        this.isFilter = false;
        const event = { page: 1 };
        this.showPagination = false;
        this.pageChanged(event, true);
      }
    }

      /* This function is use for filter data */
  filterData() {
    for (const propName in this.params) {
      if (this.params[propName] === null || this.params[propName] === undefined || this.params[propName] === "") {
        delete this.params[propName];
      }
    }

    /*Use for check that filter value has object contains */
    if (Object.keys(this.params).length === 0 && this.params.constructor === Object) {
      this.isFilter = false;
    } else {
      this.isFilter = true;
    }

    const event = { page: 1 };
    this.showPagination = false;
    this.pageChanged(event, true);
  }

    // /*This function is use for sorting */
    headerSort(field_name, order_type) 
    {
      this.sort_field = field_name;
      if (!this.fieldNameUsed) 
      {
          this.fieldNameUsed = this.sort_field;
          this.sort_type = order_type;
          if (order_type === 'asc') 
          {
            this.order_type = 'desc';
          } else 
          {
            this.order_type = 'asc';
          }
      } else if (this.fieldNameUsed === field_name) 
      {
          this.sort_type = order_type;
          if (order_type === 'asc') {
            this.order_type = 'desc';
          } else {
            this.order_type = 'asc';
          }
      } else {
          this.fieldNameUsed = field_name;
          this.order_type = 'desc';
          this.sort_type = 'asc';
      }
        const event = { page: 1 };
        this.showPagination = false;
        this.pageChanged(event, true);
    }


    updateStatus(status, categoryId, i, displayStatus)
    {
        Swal.fire({
          title: 'Are you sure?',
          text: 'You want to update student status',
          type: 'warning',
          showCancelButton: true, allowOutsideClick: false, allowEscapeKey: false,
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        }).then((result) => 
        {
          //const disStatus = !displayStatus;
          const statusVal = (status === 1) ? 0 : 1;

          if (result.value) 
          {              
              this.toastrService.clear();
              let api_url = 'update_status_student_admin'; 
              
              this.studentService.past_data_to_server(api_url,{ cate_id: categoryId,status: statusVal}).subscribe(response => {
                this.toastrService.success('Student Status Update successfully', 'Student');
                this.getStudentlist_admin(this.offset, this.limit);

            }, error => {          
              this.toastrService.error('', error.error.message);
            });
            

          }
        });

    }



}
