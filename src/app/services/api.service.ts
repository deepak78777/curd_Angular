import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }
  public MainUrl = 'http://localhost:8000/';

  public records=`${this.MainUrl}/api/records/`
  public create=`${this.MainUrl}/api/create/`

}
