import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { CoachesService } from '../../services/coaches.service';
import { Router, ActivatedRoute } from '@angular/router';



class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-coaches',
  templateUrl: './studentList.component.html',
  styleUrls: ['./coaches.component.scss']
})
export class StudentListComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
    // persons: Person[];
    persons: any = [];
  constructor(
              public router: Router,
              private route: ActivatedRoute,
              private http: HttpClient,
              private coachesService: CoachesService,
             ) { }

  ngOnInit(): void {
    const that = this;
    let reqData = this.route.snapshot.queryParams;

    console.log("iddddddddddddddddddddd",reqData);
    
    that.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.coachesService.getCoacheList(dataTablesParameters)
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

}
