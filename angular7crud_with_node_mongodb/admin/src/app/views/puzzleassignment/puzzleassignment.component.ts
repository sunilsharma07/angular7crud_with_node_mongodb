import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PuzzleassignmentService } from '../../services/puzzleassignment.service';
import { AddassignmentComponent } from './addassignment/addassignment.component';
import { EditassignmentComponent } from './editassignment/editassignment.component';
import * as moment from 'moment';
import {saveAs} from 'file-saver';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-puzzleassignment',
  templateUrl: './puzzleassignment.component.html',
  styleUrls: ['./puzzleassignment.component.scss']
})
export class PuzzleassignmentComponent implements OnInit {
  
  
    persons: any = [];
    dtOptions: DataTables.Settings = {};    
    m_persons: any = [];
    bsModalRef: BsModalRef;
    private subscriptions;
    subAdminList: any = [];
    ppuzzle_category_list : any;

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

  constructor(private http: HttpClient,
      private puzzleassignmentService: PuzzleassignmentService,
      private fb: FormBuilder,
      private router: Router,    
      private toastrService: ToastrService,
      private modalService: BsModalService,
) { }

  getlist(){
    const that = this;

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.puzzleassignmentService.getStudentList(dataTablesParameters)
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
   
      //this.getlist();
      this.getpuzzle_category_list(this.offset, this.limit);
      this.get_puzzle_category_list();
  }

  get_puzzle_category_list()
  {
       let api_name = 'list_puzzle_category_dropdown';

       let reqParams = {      
           option: 1,
       };

        this.puzzleassignmentService.past_data_to_server(api_name,reqParams).subscribe(response => 
          {
              this.resData = response;
              this.ppuzzle_category_list = this.resData.data;

        }, error => {          
            this.toastrService.error('', error.error.message);
        });
   }

  getpuzzle_category_list(offset: number, limit: number, resetPagination: Boolean = false) 
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

        if(this.isFilter) 
        {
          filter = Object.assign({}, this.params);
          
            if(this.params.date) 
            {
              const obj = {
                'startDate': moment(this.params.date[0]).format('YYYY-MM-DD'),
                'endDate': moment(this.params.date[1]).format('YYYY-MM-DD'),
                'field': "created_at"
              };
              filter['date'] = obj;
              
            }
        }

        this.puzzleassignmentService.getCategories(offset, limit, sort, filter).subscribe(response => 
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
    this.getpuzzle_category_list(this.offset, this.limit, resetPagination);
  }

  // /* This function is use for sorting */
  sorting() {
    if (this.totalItem > 10) {
      const event = { page: 1 };
      this.showPagination = false;
      this.pageChanged(event, true);
    }
  }

   /* This function is use for reset filter */
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


  openpuzzleModal(type,data = {}, index = 0)
  {
           if(type=='add')
           {
                const initialState = 
                  {
                      type: type,
                      subAdminData: data,
                      class: "modal-lg"
                  };
                this.bsModalRef = this.modalService.show(AddassignmentComponent, 
                  {
                    initialState, class: 'modal-lg', backdrop: true, ignoreBackdropClick: true
                });

                /*this.subscriptions = this.modalService.onHide.subscribe((reason: string) => {
                  if (this.bsModalRef.content.type === 'success') {

                    this.getpuzzle_category_list(0, this.limit, true);
                    
                  }
                  this.subscriptions.unsubscribe();
                });*/
           }
           else if(type=='edit')
           {
              var record_edit = this.categoriesList[index];

              var custom_obj = {
                  category_name:record_edit.category_name[0],
                  name:record_edit.name,
                  status:record_edit.status,
                  download_file_path:record_edit.pgnFile,
                  _id:record_edit._id
              };
              
                const initialState = 
                  {
                      type: type,
                      subAdminData: custom_obj,
                      class: "modal-lg"
                  };
                this.bsModalRef = this.modalService.show(EditassignmentComponent, 
                  {
                    initialState, class: 'modal-lg', backdrop: true, ignoreBackdropClick: true
                });
           }

           this.subscriptions = this.modalService.onHide.subscribe((reason: string) => {
            if (this.bsModalRef.content.type === 'success') {
                  this.getpuzzle_category_list(0, this.limit, true);              
            }
            else if (this.bsModalRef.content.type === 'edit') {
               this.getpuzzle_category_list(0, this.limit, true);              
             }

            this.subscriptions.unsubscribe();
          });
  }

  download_file(file_name,original_file_name)
  {
        
       Swal.fire({
        title: 'Are you sure?',
        text: 'You want to Download File',
        type: 'success',
        showCancelButton: true, allowOutsideClick: false, allowEscapeKey: false,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel'
      }).then((result) => 
      {
        if (result.value) 
        {
             let api_url = 'download_files';
           let image_ext =  file_name.split('.').pop();
          this.puzzleassignmentService.download_email_attachment(api_url,{ filename:file_name},image_ext)
               .subscribe(
                 response => {
                    saveAs(response,original_file_name);
                 }, error => { console.error(error)});

        }
      });
  }

  delete_cate(cateidd:any)
  {
     Swal.fire({
       title: 'Are you sure?',
       text: 'You want to delete puzzle assignment',
       type: 'warning',
       showCancelButton: true, allowOutsideClick: false, allowEscapeKey: false,
       confirmButtonText: 'Yes',
       cancelButtonText: 'Cancel'
     }).then((result) => 
     {
       if (result.value) {
         this.toastrService.clear();
           let apiurl = 'delete_puzzle_assignment';
           this.puzzleassignmentService.past_data_to_server(apiurl,{ cate_id: cateidd }).subscribe(response => {
             this.toastrService.success('puzzle assignment delete successfully', 'Puzzle Assignment');
             this.getpuzzle_category_list(0, this.limit, true);

          }, error => {          
            this.toastrService.error('', error.error.message);
          });

       }
     });

  }

  updateStatus(status, categoryId, i, displayStatus)
    {
          
        Swal.fire({
          title: 'Are you sure?',
          text: 'You want to update puzzle category status',
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
              let api_url = 'update_status_puzzle_assignment'; 

              this.puzzleassignmentService.past_data_to_server(api_url,{ cate_id: categoryId,status: statusVal}).subscribe(response => {
                this.toastrService.success('Puzzle Assignment update successfully', 'Puzzle Assignment');
                this.getpuzzle_category_list(this.offset, this.limit);
             }, error => {          
               this.toastrService.error('', error.error.message);
             });
             

          }
        });
    }


}
