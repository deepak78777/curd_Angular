import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { AuthServiceService } from '../../services/auth-service.service';

@Component({
  selector: 'app-header',
  imports: [MatIconModule,MatButtonModule,MatToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor (private auth:AuthServiceService){}  
  islogout(){
    this.auth.logout()
  }
}
