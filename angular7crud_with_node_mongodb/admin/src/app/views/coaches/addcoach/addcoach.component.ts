import { Component, OnInit,Renderer } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, ValidatorFn } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
//import { PuzzleassignmentService } from '../../../services/puzzleassignment.service';
import { CoachesService } from '../../../services/coaches.service';



@Component({
  selector: 'app-addcoach',
  templateUrl: './addcoach.component.html',
  styleUrls: ['./addcoach.component.scss']
})

export class AddcoachComponent implements OnInit {
  
  subSendForm: FormGroup;
  isSubmitted: Boolean = false;
  isDataLoading: Boolean = false;
  public btnDisabled = false;
  resData: any;  
  user_cate_dropdown:any;
  user_category_list : any;
  puzzle_category_list : any;
  currrentUserData  :any;
  returnRes:any;
  imagess_name = [];
  images_y:any = []; 
  all_files:any = [];
  all_files_post:any;
  chk_file_validation = '0';
  chk_puzzle_cate_valid:any;
  chk_upload_valid:any;

  /*************Multiple file Upload with text related variable******************/
  public documentGrp: FormGroup;
  public totalfiles: Array<File> =[];
  public totalFileName = [];
  public lengthCheckToaddMore =0;
  


  constructor(
    private fb: FormBuilder,
    private coachesService: CoachesService,
    public bsModalRef: BsModalRef,
    private toastrService: ToastrService,
    private renderer: Renderer
  ) {
    
    this.subSendForm = fb.group({
      co_f_name : ['', [Validators.required]],
      co_l_name : ['', [Validators.required]],
      co_email : ['', [Validators.required]],
      co_phone : ['', [Validators.required]],
      co_password : ['', [Validators.required]],
      cate_status:['', [Validators.required]],
    });

    
  }



  ngOnInit() 
  {
    this.subSendForm.patchValue({
      cate_status: 1,
    });  
     
  }

  onSubmit()
  {
      console.log('------uuuuuuu------');
      console.log('on submit function');

    this.isSubmitted = true;

      if(this.subSendForm.valid) 
      {
        this.btnDisabled = true;
        this.isDataLoading = true;
        this.toastrService.clear();
          
          //console.log(this.subSendForm.value);

          const forms = new FormData();
          forms.append('first_name',this.subSendForm.value.co_f_name);
          forms.append('last_name',this.subSendForm.value.co_l_name);
          forms.append('email',this.subSendForm.value.co_email);
          forms.append('phone',this.subSendForm.value.co_phone);
          forms.append('password',this.subSendForm.value.co_password);
          forms.append('status',this.subSendForm.value.cate_status);

            var filesAmount = this.all_files.length;            
            for (let i = 0; i < filesAmount; i++) 
            {
                forms.append('files',this.all_files[i]);
            }


          let api_name = 'addedCoach';
      
          this.coachesService
          .past_data_to_server(api_name,forms)
          .subscribe(
              response => {
                  this.isDataLoading = false;
                  this.btnDisabled = false;
                  this.resData = response;
                  this.returnRes = { success: true, message: this.resData.message };
                  this.toastrService.success(this.resData.message,'Coach');
                  this.bsModalRef.hide();
                  this.bsModalRef.content.type = "success";

              }, err => {
                  this.btnDisabled = false;
                  this.toastrService.error("", err.error.message);
              });

      }

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
         }
     }

  }

   
  onCancel() 
  {
      this.bsModalRef.hide();
  }

 



}
