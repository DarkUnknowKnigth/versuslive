import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSource = new BehaviorSubject<any>({});
  // creando observable para compartir la informacion de usuario entre componentes
  public user = this.userSource.asObservable();
  private isAuthSource = new BehaviorSubject<boolean>( false );
  // creando observable para compartir la el estatus de usuario entre componentes
  public isAuth = this.isAuthSource.asObservable();
  constructor(private authfb: AngularFireAuth) {
    // authstate devuelve un usuario (google o con el que nos autenticamos) o null
    this.authfb.authState.subscribe( user => {
      if ( !user ) {
        return;
      }
      // si nos devielve un usuario lo guardamos
      this.setAuthUser(user);
      this.setAuthUserStatus(true);
    }, err => {
      console.log(err);
    });
  }
  setAuthUser(user: any): void {
    // guardamos al usuario en el local storage
    localStorage.setItem('_VERSUS_', JSON.stringify(user));
    // actualizamos el usuario en el observable
    this.userSource.next(user);
  }
  setAuthUserStatus(status: boolean): void {
    this.isAuthSource.next(status);
  }
  login(): void {
    // si hay datos en el local estorage se auto logea
    const user = JSON.parse(localStorage.getItem('_VERSUS_'));
    if (user) {
      this.setAuthUser(user);
      this.setAuthUserStatus(true);
      return;
    }
    else{
      this.authfb.signInWithPopup( new auth.GoogleAuthProvider()).then( u => {
        console.log(u);
        this.setAuthUser(u);
        this.setAuthUserStatus(true);
      });
    }
  }
  logout(): void {
    localStorage.removeItem('_VERSUS_');
    this.setAuthUser({});
    this.authfb.signOut();
  }
}
