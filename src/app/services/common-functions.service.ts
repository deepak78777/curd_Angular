import { Injectable } from '@angular/core';
import {MatSnackBar,MatSnackBarConfig} from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class CommonFunctionsService {

  constructor(private snackbar:MatSnackBar) { }

  showSnackbar(message:string){
        const config: MatSnackBarConfig={
          duration:5000,
          horizontalPosition:'right',
          verticalPosition:'top',
        }
        this.snackbar.open(message,'close',config)
      }
}
