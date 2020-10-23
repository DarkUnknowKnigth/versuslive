import { Component,  } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user: any;
  constructor(private authsv: AuthService, private router: Router) {
    this.authsv.user.subscribe( user => {
      this.user = user;
      if (this.user.uid) {
        this.router.navigateByUrl('live');
      }
    });
  }
  login(): void {
    this.authsv.login();
    this.router.navigateByUrl('live');
  }

}
