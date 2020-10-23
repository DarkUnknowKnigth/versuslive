import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SongModel } from '../models/song.model';
import { AuthService } from '../services/auth.service';
// modulo para base de datos en tiempo real
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Observable } from 'rxjs';
// modulo para subirda de archivos
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  enable1Ref: AngularFireObject<any>;
  enable1$: Observable<boolean>;
  enable1: boolean;
  enable2Ref: AngularFireObject<any>;
  enable2$: Observable<boolean>;
  enable2: boolean;
  nextRef: AngularFireObject<boolean>;
  next$: Observable<boolean>;
  versusRef: AngularFireObject<SongModel[]>;
  versus$: Observable<SongModel[]>;
  canIVote: boolean;
  songA0 = new SongModel();
  songA1 = new SongModel();
  versus: SongModel[] = [];
  user: any;
  showing = [true, true];
  duration: 2;
  // inyectar el modulo de firebase al contructor para poder hacer uso de el
  constructor(
      private authsv: AuthService,
      private db: AngularFireDatabase,
      private storage: AngularFireStorage,
      private snackbar: MatSnackBar
    ) {
    // creamos un objeto que nos servira de referencia apuntando al documento que queremos leer
    this.enable1Ref = this.db.object('enable1');
    this.enable2Ref = this.db.object('enable2');
    this.nextRef = this.db.object('next');
    this.versusRef = this.db.object('versus');
    // ahora utilizamos la referencia para escuchar los cambios en la base de datos
    this.versus$ = this.versusRef.valueChanges();
    this.enable1$ = this.enable1Ref.valueChanges();
    this.enable2$ = this.enable2Ref.valueChanges();
    this.next$ = this.nextRef.valueChanges();
    // escuchar cambios
    this.authsv.user.subscribe(user => this.user = user);
    this.enable1$.subscribe(enable => this.enable1 = enable );
    this.enable2$.subscribe(enable => this.enable2 = enable );
    this.versus$.subscribe(versus => this.versus = versus);
    // tiempo de postulacion esta activo o inactivo
    this.next$.subscribe((next): boolean => this.canIVote = next);
  }
  ngOnInit(): void {
  }
  async uploadVersus(index: number): Promise<any>{
    // verificar de cual se trata
    this.openSnackBar('Subiendo');
    if (index === 0) {
      this.showing[0] = false;
      // subir los archivos a firebase
      const songName = `${this.songA0.name}-song`;
      const coverName = `${this.songA0.name}-cover`;
      const songRef = this.storage.ref(songName);
      const coverRef = this.storage.ref(coverName);
      await this.storage.upload(songName, this.songA0.song);
      await this.storage.upload(coverName, this.songA0.cover);
      coverRef.getDownloadURL().subscribe( c => {
        songRef.getDownloadURL().subscribe( s => {
          // agregando el nombre de los contendientes
          this.songA0.userName = this.user.displayName;
          this.songA0.userPhotoURL = this.user.photoURL;
          // inicializar los votos
          this.songA0.votes = 0;
          // obtener la url de la cancion
          this.songA0.song = s;
          // obtener la url del cover
          this.songA0.cover = c;
          // agregar al versus a firebase
          console.log(this.songA0);
          this.versus[0] = this.songA0;
          this.versusRef.update(this.versus);
          if (this.versus[0].song && this.versus[1].song) {
            this.nextRef.set(false);
          }
          // bloquear la subida
          this.enable1Ref.set(true);
          this.showing[0] = true;
          this.openSnackBar('Realizado');
        });
      });
    } else {
      this.showing[1] = false;
      const songName = `${this.songA1.name}-song`;
      const coverName = `${this.songA1.name}-cover`;
      const songRef = this.storage.ref(songName);
      const coverRef = this.storage.ref(coverName);
      await this.storage.upload(songName, this.songA1.song);
      await this.storage.upload(coverName, this.songA1.cover);
      coverRef.getDownloadURL().subscribe( c => {
        songRef.getDownloadURL().subscribe( s => {
          // agregando el nombre de los contendientes
          this.songA1.userName = this.user.displayName;
          this.songA1.userPhotoURL = this.user.photoURL;
          // inicializar los votos
          this.songA1.votes = 0;
          // obtener la url de la cancion
          this.songA1.song = s;
          // obtener la url del cover
          this.songA1.cover = c;
          // agregar al versus a firebase
          console.log(this.songA1);
          this.versus[1] = this.songA1;
          this.versusRef.update(this.versus);
          if (this.versus[0].song && this.versus[1].song) {
            console.log(1);
            this.nextRef.set(false);
          }
          // bloquear la subida
          this.enable2Ref.set(true);
          this.showing[1] = true;
          this.openSnackBar('Realizado');
        });
      });
    }
  }
  updateSong(event: any , index: number): void {
    if ( index === 0 ) {
     this.songA0.song = event.target.files[0];
    } else {
      this.songA1.song  = event.target.files[0];
    }
  }
  updateCover(event: any , index: number): void {
    if ( index === 0 ) {
      this.songA0.cover = event.target.files[0];
    } else {
      this.songA1.cover = event.target.files[0];
    }
  }
  openSnackBar(message: string): void {
    this.snackbar.open( message, 'Ok',{
      duration: this.duration * 1000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
