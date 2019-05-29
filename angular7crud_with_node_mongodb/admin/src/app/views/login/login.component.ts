import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders,HttpRequest } from '@angular/common/http';
import { Headers, Http, RequestOptions, ResponseContentType } from '@angular/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
   selector: 'app-dashboard',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    // private http: HttpClient, 
    // private https: Http
    

  ) { }
  public loading = false;
  ngOnInit(): void {

    if (localStorage.getItem('userData')) {
            this.router.navigate(['dashboard']);
        } else {
           this.router.navigate(['login']);
        }
        

    this.loginForm = new FormGroup({
      email: new FormControl("", Validators.required),
      password: new FormControl("", [Validators.required]),
    });
  }
  loginFormSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      // this.toasterService.clear();
      this.loading = true;
       var postData = this.loginForm.value;
      var data = {
        email: postData.email,
        password: postData.password
      }

      this.authenticationService.login(data)
        .subscribe(
        next => {
          console.log('next',next);
          this.loading = false;
          if (next.status = 200) {
            this.router.navigate(['dashboard']);
          } else {
            this.isSubmitted = false;
          }
        },
        error => {
          this.loading = false;
          this.isSubmitted = false;
        })
    }
  }
}
