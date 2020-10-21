import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: any;
  constructor(private authsv: AuthService, private router: Router) {
    this.authsv.user.subscribe( user => this.user = user);
  }
  ngOnInit(): void {
  }
  login(): void {
    this.authsv.login();
  }

}
