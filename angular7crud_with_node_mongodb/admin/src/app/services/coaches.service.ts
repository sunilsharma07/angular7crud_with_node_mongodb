import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { CustomHttp } from '../services/custom-http';

@Injectable()
export class CoachesService {
    constructor(private http: HttpClient,private customHttp: CustomHttp) { }


    getCoacheList(dataTablesParameters) {
        return this.http.get(environment.apiUrl + 'coachList', {
        params: dataTablesParameters,
        headers: new HttpHeaders()
            .set('access_token', 'application/json'),
        observe: 'response'
        }, )
        .map(resp => {
            return resp;
        })
    }

    getCoacheStudentList(dataTablesParameters,) {
        return this.http.get(environment.apiUrl + 'studentCoachWise', {
        params: dataTablesParameters,
        headers: new HttpHeaders()
            .set('access_token', 'application/json'),
        observe: 'response'
        }, )
        .map(resp => {
            return resp;
        })
    }

    past_data_to_server(api_name, params_data)  
    {  
            return this.customHttp.post(api_name, params_data)
            .map(resp => {
                return resp;
            })

    }
    
    getCategories(offset: number = 0, limit: any = 10, sort: any = {}, filter: any = {}) 
    {
        //getpuzzleCategorieslist

        const params = { 'offset': offset, 'limit': limit, 'filter': filter, 'sort': sort, type: 'list' };
        return this.customHttp.post('getadmin_coach_list', params)
            .map((response: Response) => {
                return response;
            });
    }



}