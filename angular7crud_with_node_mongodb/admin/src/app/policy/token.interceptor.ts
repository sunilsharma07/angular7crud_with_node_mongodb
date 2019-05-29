import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
// import { AuthService } from './auth/auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    //   public auth: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const authToken = window.localStorage.getItem('access_token');
    
    // request = request.clone({
    //   setHeaders: {
    //     access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJuaWxlc2gua2Fsc2FyaXlhMTFAYWdpbGVpbmZvd2F5cy5jb20iLCJyb2xlX2lkIjowLCJpYXQiOjE1Mzg0NzQzMjksImV4cCI6MTU3MDAxMDMyOX0.SBAff77AeEKWVFL3xOIsJmbLhETZpw5bmm0YtLopL-A'
    //   }
    // });

    // return next.handle(request);

    const authToken = localStorage.access_token;

      console.log('authToken',authToken);
        
        if (!authToken) 
        {
            return next.handle(req);
        } else 
        {
            const request = req.clone({
               setHeaders: {
              access_token: authToken
            }
            });
            return next.handle(request);
        }
  }
}