import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    constructor(private http: HttpClient) { }

    login(data) {

        return this.http.post<any>(environment.loginUrl + 'login', data)
            
            .map(user => {
                console.log('user',user.data.access_token);
                // login successful if there's a jwt token in the response
                if (user) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    // localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('name', user.data.first_name);
                    // localStorage.setItem('expire', 'false');
                    localStorage.setItem('access_token', user.data.access_token);
                    localStorage.setItem('user_type', user.data.user_type);
                    localStorage.setItem('userData', JSON.stringify(user.data));
                }
                return user;
            });
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('userData');
        localStorage.removeItem('access_token');
    }
}