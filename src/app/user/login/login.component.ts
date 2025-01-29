import { Component } from '@angular/core';
import { AuthServiceService } from '../../services/auth-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthServiceService) {}

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log('Login successful');
      },
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }

}
