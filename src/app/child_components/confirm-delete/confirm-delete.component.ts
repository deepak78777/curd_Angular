import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [MatDialogModule, CommonModule, MatButtonModule],
  templateUrl: './confirm-delete.component.html',
  styleUrls: ['./confirm-delete.component.scss'],
})
export class ConfirmDeleteComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmDelete() {
    this.dialogRef.close(true); // ✅ Close dialog & return `true`
  }

  cancel() {
    this.dialogRef.close(false); // ❌ Close without deleting
  }
}
