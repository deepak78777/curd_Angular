import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CreateRecordComponent } from './create-record/create-record.component';
import { UpdateRecordComponent } from './update-record/update-record.component';
import { ConfirmDeleteComponent } from '../../child_components/confirm-delete/confirm-delete.component';

export interface PeriodicElement {
  id: number,
  amount: number,
  village: string,
  name: string,
  date: Date
}
@Component({
  selector: 'app-elements-curd',
  imports: [MatTableModule, MatPaginatorModule],
  templateUrl: './elements-curd.component.html',
  styleUrl: './elements-curd.component.scss'
})

export class ElementsCurdComponent implements AfterViewInit {
  constructor(private api:ApiService,private http:HttpClient ,private dialog:MatDialog){
    console.log('its home page')
    this.fetchData()

  }
  displayedColumns: string[] = ['id','name','amount','village','date','Actions'];
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

  open_create_dialog(){
    
      const dialogRef = this.dialog.open(CreateRecordComponent, {
        // data: {name: this.name(), animal: this.animal()},
        disableClose:true
      });
  
      dialogRef.afterClosed().subscribe((result:any) => {
        console.log('The dialog was closed');
        this.fetchData()
      });
    
  }

  openUpdateDialog(record: any) {
    console.log(record)
    const dialogRef = this.dialog.open(UpdateRecordComponent, {
      width: '400px', // Optional width
      data: record, // Pass record data
      disableClose:true,
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Update successful, refresh data');
        // Call a function to refresh your data table here
        this.fetchData()
      }
    });
  }
  openDeleteDialog(record: any) {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '350px',
      data: record,
    });
  
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteRecord(record.id);
      }
    });
  }
  
  deleteRecord(id: number) {
    this.http.delete(`${this.api.records}${id}/delete/`).subscribe({
      next: () => {
        // this.snackBar.showSnackbar('Record deleted successfully!');
        // Refresh your data table here
      },
      error: () => {
        // this.snackBar.showSnackbar('Failed to delete record!');
      },
    });
  }
}

