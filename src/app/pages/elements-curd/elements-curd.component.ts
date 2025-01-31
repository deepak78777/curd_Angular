import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-elements-curd',
  imports: [MatTableModule, MatPaginatorModule],
  templateUrl: './elements-curd.component.html',
  styleUrl: './elements-curd.component.scss'
})
export class ElementsCurdComponent implements AfterViewInit {
  constructor(private api:ApiService,private http:HttpClient){
    console.log('its home page')
    this.fetchData()

  }
  displayedColumns: string[] = ['id','name','amount','village','date'];
  dataSource = new MatTableDataSource<PeriodicElement>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  fetchData(){
    this.http.get(this.api.records).subscribe((res:any)=>{
      console.log(res)
      this.dataSource.data=res
    })

  }
}
export interface PeriodicElement {
  id: number,
  amount: number,
  village: string,
  name: string,
  date: Date
}
