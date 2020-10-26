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
  // refrerencias al la base de datos
  enable1Ref: AngularFireObject<boolean>;
  enable2Ref: AngularFireObject<boolean>;
  nextRef: AngularFireObject<boolean>;
  versusRef: AngularFireObject<SongModel[]>;
  // observables para escuchar eventos
  enable1$: Observable<boolean>;
  enable2$: Observable<boolean>;
  next$: Observable<boolean>;
  versus$: Observable<SongModel[]>;
  // variables locales
  enable1: boolean;
  enable2: boolean;
  canIVote: boolean;
  songs = [new SongModel(), new SongModel()];
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
    // escuchar cambios y almacenarlos en variales locales
    this.authsv.user.subscribe(user => this.user = user);
    this.enable1$.subscribe(enable => this.enable1 = enable );
    this.enable2$.subscribe(enable => this.enable2 = enable );
    this.versus$.subscribe(versus => this.versus = versus);
    // tiempo de postulacion esta activo o inactivo
    this.next$.subscribe((next): boolean => this.canIVote = next);
  }
  ngOnInit(): void {
  }
  // subir canciones al storage
  async uploadVersus(index: number): Promise<any>{
    this.openSnackBar('Subiendo');
    this.showing[index] = false;
    // subir los archivos a firebase
    const songName = `${this.songs[index].name}-song`;
    const coverName = `${this.songs[index].name}-cover`;
    // crear referencia al storage
    const songRef = this.storage.ref(songName);
    const coverRef = this.storage.ref(coverName);
    // subir archivo esperar promesa de retorno
    await this.storage.upload(songName, this.songs[index].song);
    await this.storage.upload(coverName, this.songs[index].cover);
    // obtener el link de descarga
    coverRef.getDownloadURL().subscribe( c => {
      songRef.getDownloadURL().subscribe( s => {
        // agregando el nombre de los contendientes
        this.songs[index].userName = this.user.displayName;
        this.songs[index].userPhotoURL = this.user.photoURL;
        // inicializar los votos
        this.songs[index].votes = 0;
        // obtener la url de la cancion
        this.songs[index].song = s;
        // obtener la url del cover
        this.songs[index].cover = c;
        // agregar al versus a firebase
        this.versus[index] = this.songs[index];
        this.versusRef.update(this.versus);
        if (this.versus[0].song && this.versus[1].song) {
          this.nextRef.set(false);
        }
        // bloquear la subida
        if (index === 0) {
          this.enable1Ref.set(true);
        } else {

          this.enable2Ref.set(true);
        }
        this.showing[index] = true;
        // informar que se completo
        this.openSnackBar('Realizado');
      });
    });
  }
  // guardar los archivos en variables locales para su posterior uso
  updateSong(event: any , index: number): void {
    if ( index === 0 ) {
     this.songs[index].song = event.target.files[0];
    } else {
      this.songs[index].song  = event.target.files[0];
    }
    console.log(this.songs);
  }
  updateCover(event: any , index: number): void {
    if ( index === 0 ) {
      this.songs[index].cover = event.target.files[0];
    } else {
      this.songs[index].cover = event.target.files[0];
    }
  }
  openSnackBar(message: string): void {
    this.snackbar.open( message, 'Ok', {
      duration: this.duration * 1000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
