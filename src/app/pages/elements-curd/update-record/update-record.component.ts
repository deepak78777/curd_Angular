import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { CommonFunctionsService } from '../../../services/common-functions.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'; // ✅ Import MatDialogRef & MAT_DIALOG_DATA

@Component({
  selector: 'app-update-record',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    MatDialogModule, // ✅ Import MatDialogModule
  ],
  templateUrl: './update-record.component.html',
  styleUrls: ['./update-record.component.scss'],
})
export class UpdateRecordComponent {
  myForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private api: ApiService,
    private snackBar: CommonFunctionsService,
    private dialogRef: MatDialogRef<UpdateRecordComponent>, // ✅ Inject MatDialogRef
    @Inject(MAT_DIALOG_DATA) public data: any // ✅ Receive existing data
  ) {
    console.log(data)
    this.myForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      amount: [data?.amount || '', [Validators.required, Validators.min(1)]],
      date: [data?.date || '', Validators.required],
      village: [data?.village || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log('Updated Data:', this.myForm.value);
      this.isSubmitting = true;

      this.http.put(`${this.api.records}${this.data.id}/`, this.myForm.value).subscribe({
        next: (res: any) => {
          console.log('Update Response:', res);
          this.snackBar.showSnackbar('Record updated successfully!');
          this.dialogRef.close(true); // ✅ Close dialog on success
        },
        error: (error) => {
          console.error('Error:', error);
          this.snackBar.showSnackbar('Failed to update record!');
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    }
  }

  onClosed(){
    this.dialogRef.close(false)
  }
}
