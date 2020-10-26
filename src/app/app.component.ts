import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  constructor(private authsv: AuthService, private router: Router){
    // Subscribirnos a el observable auth.user para ver cambios en el usuario
    this.authsv.user.subscribe( user => {
      this.user = user;
      this.menu  = [
        {
          name: 'Postular',
          link: '/admin',
          visible: this.user.uid
        },
        {
          name: 'Versus Live',
          link: '/live',
          visible: this.user.uid
        },
      ];

    });
  }
  // Cerrar sesion haciendo uso del servicio creado
  logout(): void{
    this.authsv.logout();
    this.router.navigateByUrl('login');
  }
}
