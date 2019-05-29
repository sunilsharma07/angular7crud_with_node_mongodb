import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, ValidatorFn } from '@angular/forms';

//import { PuzzlecategoryService } from '../../../services/puzzlecategory.service';
//import { PuzzleassignmentService } from '../../../services/puzzleassignment.service';
import { CoachesService } from '../../../services/coaches.service';

import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'app-editcoach',
  templateUrl: './editcoach.component.html',
  styleUrls: ['./editcoach.component.scss']
})

export class EditcoachComponent implements OnInit {
  
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
    private coachesService: CoachesService,
    public bsModalRef: BsModalRef,
    private toastrService: ToastrService

  ) {
    
    this.subSendForm = fb.group({
        co_f_name : ['', [Validators.required]],
        co_l_name:['', [Validators.required]],
        co_email:['', [Validators.required]],
        co_phone:['', [Validators.required]],
        cate_status:['', [Validators.required]],
    });

   }


  ngOnInit() 
  {
        this.subSendForm.patchValue({
          co_f_name: this.subAdminData.first_name,
          co_l_name: this.subAdminData.last_name,          
          co_email: this.subAdminData.email,
          co_phone: this.subAdminData.phone,
          cate_status:this.subAdminData.status
        });


      this.subcateId = this.subAdminData._id;
      //this.set_status = this.subAdminData.status;   

      //this.main_pgnFile = this.subAdminData.image;      
      //this.main_pgnFile_wuth_path = environment.pgn_file_path+this.main_pgnFile;
      

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
               this.all_files.push(event.target.files[i]);
               //this.chk_upload_valid='1';
         }
     }

  }


  onSubmit()
  {
      this.isSubmitted = true;

      if(this.subSendForm.valid) 
      {
          this.btnDisabled = true;
          this.isDataLoading = true;
          this.toastrService.clear();
          
           const forms = new FormData();           
           forms.append('first_name',this.subSendForm.value.co_f_name);
           forms.append('last_name',this.subSendForm.value.co_l_name);
           forms.append('email',this.subSendForm.value.co_email);
           forms.append('phone',this.subSendForm.value.co_phone);
           forms.append('status',this.subSendForm.value.cate_status);
           forms.append('old_image',this.subAdminData.image);                 
           forms.append('_id',this.subcateId);  

            var filesAmount = this.all_files.length;

            for (let i = 0; i < filesAmount; i++) 
            {
              forms.append('files',this.all_files[i]);
            }


          let api_name = 'updateadmin_coach';
      
          this.coachesService
          .past_data_to_server(api_name,forms)
          .subscribe(
              response => {
                  this.isDataLoading = false;
                  this.btnDisabled = false;
                  this.resData = response;
                  this.returnRes = { success: true, message: this.resData.message };
                  this.toastrService.success(this.resData.message,'Coach Update');
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
