import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }
  // public MainUrl = 'https://curd-angular-2.onrender.com';
  public MainUrl = 'http://127.0.0.1:8000/';

  public records=`${this.MainUrl}/api/records/`
  public create=`${this.MainUrl}/api/create/`
  public delete=`${this.MainUrl}/api/delete/`
}
