import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Versus Live';
  user: any = {};
  menu = [];
  constructor(private authsv: AuthService){
    this.authsv.user.subscribe( user => {
      this.user = user;
      this.menu  = [
        {
          name: 'Administrador',
          link: '/admin',
          visible: this.user
        },
        {
          name: 'Versus Live',
          link: '/live',
          visible: this.user
        },
      ];

    });
  }
  logout(): void{
    this.authsv.logout();
  }
}
