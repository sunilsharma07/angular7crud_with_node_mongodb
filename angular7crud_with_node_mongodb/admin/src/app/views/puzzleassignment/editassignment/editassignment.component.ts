import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, ValidatorFn } from '@angular/forms';

//import { PuzzlecategoryService } from '../../../services/puzzlecategory.service';
import { PuzzleassignmentService } from '../../../services/puzzleassignment.service';

import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'app-editassignment',
  templateUrl: './editassignment.component.html',
  styleUrls: ['./editassignment.component.scss']
})
export class EditassignmentComponent implements OnInit {
  
  subSendForm: FormGroup;
  isSubmitted: Boolean = false;
  isDataLoading: Boolean = false;
  public btnDisabled = false;
  resData: any;
  //type: string;
  user_cate_dropdown:any;
  user_category_list : any;
  currrentUserData  :any;
  returnRes:any;
  imagess_name = [];
  images_y:any = []; 
  all_files:any = [];
  all_files_post:any;
  subAdminData: any;
  subcateId: string;
  subAdminForm: FormGroup;
  set_status:any;
  main_pgnFile:any;
  main_pgnFile_wuth_path:any;
  chk_upload_valid:any;


  constructor(
    private fb: FormBuilder,
    private PuzzlecategoryService: PuzzleassignmentService,
    public bsModalRef: BsModalRef,
    private toastrService: ToastrService

  ) {
    
    this.subSendForm = fb.group({
       category_name : ['', [Validators.required]],
       name:['', [Validators.required]],
       cate_status:['', [Validators.required]],
    });

   }


  ngOnInit() 
  {
        this.subSendForm.patchValue({
          category_name: this.subAdminData.category_name.trim(),
          name: this.subAdminData.name,
          cate_status:this.subAdminData.status
        });

      this.subcateId = this.subAdminData._id;
      this.set_status = this.subAdminData.status;   
      this.main_pgnFile = this.subAdminData.download_file_path;
      
      this.main_pgnFile_wuth_path = environment.pgn_file_path+this.main_pgnFile;
      

  }

  onSelectFile(event)
  {
    if (event.target.files && event.target.files[0]) 
     {
         this.all_files = [];
         var filesAmount = event.target.files.length;
         this.all_files_post = event.target.files;
         
         for (let i = 0; i < filesAmount; i++) 
         {             

               var fileName = event.target.files[i].name;
               var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));

                 if(fileExtension=='pgn')
                 {
                   this.all_files.push(event.target.files[i]);
                   this.chk_upload_valid='1';
                 }
                 else{
                    this.chk_upload_valid='0';
                 }
             
         }
     }

  }


  onSubmit()
  {

       if(this.chk_upload_valid=='0')
       {
            return;
       }

      this.isSubmitted = true;

      if(this.subSendForm.valid) 
      {
          this.btnDisabled = true;
          this.isDataLoading = true;
          this.toastrService.clear();
          
          
          /*const reqParams = {      
            category_name: this.subSendForm.value.category_name,
            name: this.subSendForm.value.name,
            cate_status: this.subSendForm.value.cate_status,            
            puzzle_id:this.subcateId
           };*/

           
           const forms = new FormData();           
           forms.append('name',this.subSendForm.value.name);
           forms.append('status',this.subSendForm.value.cate_status);
           forms.append('_id',this.subcateId);  
           forms.append('main_pgnFile',this.main_pgnFile);  
           

            var filesAmount = this.all_files.length;

            for (let i = 0; i < filesAmount; i++) 
            {
              forms.append('files',this.all_files[i]);
            }


          let api_name = 'update_puzzle';
      
          this.PuzzlecategoryService
          .past_data_to_server(api_name,forms)
          .subscribe(
              response => {
                  this.isDataLoading = false;
                  this.btnDisabled = false;
                  this.resData = response;
                  this.returnRes = { success: true, message: this.resData.message };
                  this.toastrService.success(this.resData.message,'Puzzle/Assignment');
                  this.bsModalRef.hide();
                  this.bsModalRef.content.type = "edit";

              }, err => {
                  this.btnDisabled = false;
                  this.toastrService.error("", err.error.message);
              });

      }

  }
  
  onCancel() 
  {
      this.bsModalRef.hide();
  }


}
