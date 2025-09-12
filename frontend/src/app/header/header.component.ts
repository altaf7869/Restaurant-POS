import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout(); 
    this.router.navigateByUrl('/login'); 
  }

}
