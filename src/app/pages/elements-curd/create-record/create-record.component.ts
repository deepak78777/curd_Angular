import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { CommonFunctionsService } from '../../../services/common-functions.service';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog'; // ✅ Import MatDialogRef

@Component({
  selector: 'app-create-record',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule, // ✅ Added this
    MatDialogModule
  ],
  templateUrl: './create-record.component.html',
  styleUrls: ['./create-record.component.scss'], // ✅ Fixed styleUrls
})
export class CreateRecordComponent {
  myForm: FormGroup;
  isSubmitting = false; // ✅ Added loading state

  constructor(
    private dialogRef: MatDialogRef<CreateRecordComponent>, // ✅ Inject MatDialogRef
    private fb: FormBuilder,
    private http: HttpClient,
    private api: ApiService,
    private snackBar: CommonFunctionsService // ✅ Injected MatSnackBar
  ) {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      date: ['', Validators.required],
      village: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log('Form Data:', this.myForm.value);
      this.isSubmitting = true; // ✅ Show loading state

      this.http.post(this.api.create, this.myForm.value).subscribe({
        next: (res: any) => {
          console.log('Response:', res);
          this.snackBar.showSnackbar('Form submitted successfully!');
          // this.myForm.reset(); // ✅ Reset form after success
          this.onClosed()
        },
        error: (error) => {
          console.error('Error:', error);
          this.snackBar.showSnackbar('Failed to submit form!');
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
    } 
  }

  onClosed(){
    this.dialogRef.close()
  }
}
