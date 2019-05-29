import { Component, OnInit,Renderer } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, ValidatorFn } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PuzzleassignmentService } from '../../../services/puzzleassignment.service';


@Component({
  selector: 'app-addassignment',
  templateUrl: './addassignment.component.html',
  styleUrls: ['./addassignment.component.scss']
})

export class AddassignmentComponent implements OnInit {
  
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

  /*************Multiple file Upload with text related variable******************/
  public documentGrp: FormGroup;
  public totalfiles: Array<File> =[];
  public totalFileName = [];
  public lengthCheckToaddMore =0;
  


  constructor(
    private fb: FormBuilder,
    private PuzzleassignmentService: PuzzleassignmentService,
    public bsModalRef: BsModalRef,
    private toastrService: ToastrService,
    private renderer: Renderer
  ) {
    
    /*this.documentGrp = fb.group({
      puzzle_category : ['', [Validators.required]],
      //cate_status:['', [Validators.required]],
    });*/

    this.documentGrp = this.fb.group({
      puzzle_category:'',
      cate_status:'',
      doc_name: '',
      //doc_description: '',
      documentFile:new FormControl(File),
      items: this.fb.array([this.createUploadDocuments()])
    });
   }

   createUploadDocuments(): FormGroup {
      return this.fb.group({
        doc_name: '',
        //doc_description: '',
        documentFile : File
      });
  }

  get items(): FormArray 
  {
    return this.documentGrp.get('items') as FormArray;
  };

 addItem(): void 
 {
          console.log('that thing is calling what is this');

          var total_fiels_check = this.totalfiles;

          console.log(this.totalfiles);

            for (let i = 0; i < total_fiels_check.length; i++) 
            {
                      console.log('enttrt forr loop');
                    var fileName = total_fiels_check[i].name
                    var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));

                    if(fileExtension!='pgn')
                      {
                          console.log('yes there check it !'+i);
                          this.removeItem_array(i);
                          this.chk_file_validation = '1';

                           console.log('fire the validation');
                           
                            break;
                            //return;

                      }
                      else{
                        //this.chk_file_validation='0';
                      }
                      

            }    

       if(this.chk_file_validation=='1')
       {
            console.log('that is calliing yuppppppppppppppppp');
             return;
       }
 

        //if(this.totalfiles.length!=0 && this.chk_file_validation=='0')
       if(this.totalfiles.length!=0)
        {
            //console.log('add item if consition entry');

              if( this.items.value[0].doc_name != ""  && ((this.lengthCheckToaddMore) === (this.totalfiles.length)) )
              {   

                    var fileName = this.totalfiles[0].name;
                    var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));

                    this.items.insert(0, this.createUploadDocuments())
                    this.lengthCheckToaddMore=this.lengthCheckToaddMore+1;
                    
                    /*if(fileExtension=="pgn" || fileExtension=="PGN")
                    {
                        this.items.insert(0, this.createUploadDocuments())
                        this.lengthCheckToaddMore=this.lengthCheckToaddMore+1;
                    }
                    else{
                        console.log('that is wrong dear'+this.totalfiles.length);
                        this.toastrService.success('Please Upload Only pgn File','Puzzle/Assignment');
                    }*/
                    
              }
              else{
                //console.log('else part neeeewwwwwwwwwwwwwwwwwwwwwwww');
              }

        }
        else{
           //console.log('else part tttttttttttttttttt');
                     // this.items.insert(0, this.createUploadDocuments())
                    //this.lengthCheckToaddMore=this.lengthCheckToaddMore+1;
             
        }
      
 }

 removeItem_array(index: number) {
      this.totalfiles.splice(index,1);
      this.totalFileName.splice(index,1);
      //this.lengthCheckToaddMore=this.lengthCheckToaddMore-1;
 }   

 removeItem(index: number) {  
      this.totalfiles.splice(index,1);
      this.totalFileName.splice(index,1);
      this.items.removeAt(index);
      this.lengthCheckToaddMore=this.lengthCheckToaddMore-1;
    // console.log("name are ",this.totalFileName);
 }

public fileSelectionEvent_B(fileInput: any,oldIndex)
{
     if(fileInput.target.files && fileInput.target.files[0]) 
     {
         var reader = new FileReader();
          reader.onload = (event: any) => {}
          if(oldIndex==0)
          {
              this.totalfiles.unshift((fileInput.target.files[0]))
              this.totalFileName.unshift(fileInput.target.files[0].name);
              this.chk_file_validation='0';

          }
          else{

            this.totalfiles[oldIndex]=(fileInput.target.files[0]);
            this.totalFileName[oldIndex]=fileInput.target.files[0].name;
            this.chk_file_validation='0';  
          }

          reader.readAsDataURL(fileInput.target.files[0]);        

     }

       if(this.totalfiles.length == 1)
          {
             //console.log('yesssssssssssssssssssssssssss that calling ..............');
            this.lengthCheckToaddMore=1;
          }

}

 public fileSelectionEvent(fileInput: any,oldIndex) 
  {
          

          if(fileInput.target.files && fileInput.target.files[0]) 
          {
            var reader = new FileReader();
            reader.onload = (event: any) => {
            }

            if(oldIndex==0)
              {
                  var fileName = fileInput.target.files[0].name;
                  var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));


                      //if(fileExtension=='pgn' || fileExtension=='PGN')
                      {
                          this.totalfiles.unshift((fileInput.target.files[0]))
                          this.totalFileName.unshift(fileInput.target.files[0].name);
                          this.chk_file_validation='0';                        
                          reader.readAsDataURL(fileInput.target.files[0]);
                          

                      }

              }
              else
              {
                    var fileName = fileInput.target.files[0].name;
                    var fileExtension = fileName.substr((fileName.lastIndexOf('.') + 1));
                  
                    //if(fileExtension=='pgn' || fileExtension=='PGN')
                    {
                        this.totalfiles[oldIndex]=(fileInput.target.files[0]);
                        this.totalFileName[oldIndex]=fileInput.target.files[0].name; 
                        this.chk_file_validation='0';                     
                        reader.readAsDataURL(fileInput.target.files[0]);
                    }
    
              }
              
                
            
          }
        
          if(this.totalfiles.length == 1)
          {
            this.lengthCheckToaddMore=1;
          }

  }

  

  public OnSubmit(formValue: any) {

        //console.log('submit function over here..');
        //console.log(this.chk_puzzle_cate_valid);

        if(this.chk_puzzle_cate_valid=='0' || typeof this.chk_puzzle_cate_valid==="undefined" || this.chk_puzzle_cate_valid=='')
        {
            this.chk_puzzle_cate_valid='0';
             return;
        }
       
           if(this.chk_file_validation=='0')
           {

                let main_form: FormData = new FormData();
                main_form.append('puzzle_cate_id',this.documentGrp.value.puzzle_category);
                main_form.append('status',this.documentGrp.value.cate_status);

                for(let j=0;j<this.totalfiles.length; j++)
                {      
                  //console.log("the values is ",<File>this.totalfiles[j]);
                  main_form.append('files',<File>this.totalfiles[j])
                  
                }

                let AllFilesObj= []

                  formValue.items.forEach((element, index) => { 

                        let eachObj=
                        {
                          'doc_name' : element.doc_name,
                          //'file_name' : this.totalFileName[index],
                          //index:element.doc_name
                        }
                      AllFilesObj.push(eachObj); 
                  });

                  main_form.append("fileInfo",JSON.stringify(AllFilesObj));


                  let api_name = 'add_puzzle_assignment';
                  
                      this.PuzzleassignmentService
                      .past_data_to_server(api_name,main_form)
                      .subscribe(
                          response => {
                              this.isDataLoading = false;
                              this.btnDisabled = false;
                              this.resData = response;
                              this.returnRes = { success: true, message: this.resData.message };
                              this.toastrService.success(this.resData.message,'Puzzle/Assignment');
                              this.bsModalRef.hide();
                              this.bsModalRef.content.type = "success";

                          }, err => {
                              this.btnDisabled = false;
                              this.toastrService.error("", err.error.message);
                          });

          }
  }

  public OnSubmit_old_is_gold(formValue: any) {

    var core_data = {      
      puzzle_cate_id: this.documentGrp.value.puzzle_category,
     }; 
     
     console.log(core_data); 
     console.log('----------Above part 0-------------------------');



    let main_form: FormData = new FormData();

    for(let j=0;j<this.totalfiles.length; j++)
    {
      console.log("the values is ",<File>this.totalfiles[j]);
      console.log("the name is ",this.totalFileName[j]);
      
      main_form.append(this.totalFileName[j],<File>this.totalfiles[j])
    }
    console.log(formValue.items)
   
    console.log('----------Above part 1-------------------------');

    //reverseFileNames=this.totalFileName.reverse();
   
    let AllFilesObj= []

    formValue.items.forEach((element, index) => { 
     
      console.log("index is ",index);
      console.log("element is ", element);
      
      let eachObj=
      {
        'doc_name' : element.doc_name,
        'file_name' : this.totalFileName[index]
      }
      AllFilesObj.push(eachObj); 
    });


    console.log('----------Above part 2-----------------------');

    //console.log("the Array data is ",AllFilesObj);
    main_form.append("fileInfo",JSON.stringify(AllFilesObj));

      console.log(main_form);

    console.log('----------Above part 3-------------------------');
  
    /*this.multifilesService.saveFiles(main_form).subscribe(data => {
      
    })*/
  }


  ngOnInit() 
  {
    this.documentGrp.patchValue({
      cate_status:1,
      puzzle_category:''

    });

      this.get_puzzle_category_list();
     
  }

  get_puzzle_category_list()
  {
       let api_name = 'list_puzzle_category_dropdown';

       let reqParams = {      
           option: 1,
       };

        this.PuzzleassignmentService.past_data_to_server(api_name,reqParams).subscribe(response => 
          {
              this.resData = response;
              this.puzzle_category_list = this.resData.data;

        }, error => {          
            this.toastrService.error('', error.error.message);
        });
   }

   
  onCancel() 
  {
      this.bsModalRef.hide();
  }

  onChange_puzzle_cate(index:any)
  {
        //console.log('---yes we are do it--');
        //console.log(index); 

          if(index=='' || index=='undefined')
          {
             this.chk_puzzle_cate_valid = '0';         
          }
          else{
             this.chk_puzzle_cate_valid = '1';
          }

  }



}
