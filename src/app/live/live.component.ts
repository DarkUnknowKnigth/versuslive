import { Component, OnInit } from '@angular/core';
import { Track } from 'ngx-audio-player';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { SongModel } from '../models/song.model';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AngularFireStorage } from '@angular/fire/storage';
@Component({
  selector: 'app-live',
  templateUrl: './live.component.html',
  styleUrls: ['./live.component.css']
})
export class LiveComponent implements OnInit {
  user: any;
  // conexiones
  songsRef: AngularFireObject<SongModel[]>;
  versusRef: AngularFireObject<SongModel[]>;
  nextRef: AngularFireObject<any>;
  enable1Ref: AngularFireObject<any>;
  enable2Ref: AngularFireObject<any>;
  // observables
  songs$: Observable<SongModel[]>;
  versus$: Observable<SongModel[]>;
  next$: Observable<boolean>;
  enable1$: Observable<boolean>;
  enable2$: Observable<boolean>;
  // variables locales
  songs: SongModel[];
  versus: SongModel[];
  playlist: Track[] = [];
  enable1: boolean;
  enable2: boolean;
  displayTitle = true;
  displayPlayList = true;
  voted = false;
  next = false;
  displayVolumeControls = true;
  disablePositionSlider = false;
  pageSizeOptions = [10, 50, 100];
  v = [true, true];
  list = false;
  constructor(private db: AngularFireDatabase, private authsv: AuthService, private storage: AngularFireStorage) {
    // crear referencia al documento
    this.songsRef = this.db.object('songs');
    this.versusRef = this.db.object('versus');
    this.enable1Ref = this.db.object('enable1');
    this.enable2Ref = this.db.object('enable2');
    this.nextRef = this.db.object('next');
    // Escuchar cambios en cada referencia
    this.songs$ = this.songsRef.valueChanges();
    this.versus$ = this.versusRef.valueChanges();
    this.enable1$ = this.enable1Ref.valueChanges();
    this.enable2$ = this.enable2Ref.valueChanges();
    this.next$ = this.nextRef.valueChanges();
    // Guardar los datos del el documento en una variables locales
    this.versus$.subscribe( versus => this.versus = versus);
    this.next$.subscribe(next => this.next = next);
    this.enable1$.subscribe(enable => this.enable1 = enable);
    this.enable2$.subscribe(enable => this.enable2 = enable);
    this.authsv.user.subscribe( user => this.user = user);
    this.songs$.subscribe( songs => {
      this.songs = songs;
      // adaptar a la interface que ngx-audio nos pide
      if (this.songs && this.songs.length > 0) {
        this.playlist = this.songs.map(song => {
          return { title: song.name, link: song.song };
        });
      } else {
        alert('no hay canciones');
        this.deliver();
      }
    });
  }
  ngOnInit(): void {}
  onEnded(): void{
    // deliverar quien gano
    if (this.versus[0].song && this.versus[1].song) {
      this.deliver();
    }
  }
  addVote(index: number): void{
    if (!this.voted){
      this.v[index === 0 ? 1 : 0 ] = false ;
      // agregar votos dependiendo el index
      this.versus[index].votes += 1;
      // actualizar por medio de update la lista
      this.versusRef.update(this.versus);
      // vandera para evitar doble voto
      this.voted = true;
    }
  }
  // deliverar que cancion gano y resetear la restriccion de subir musica
  deliver(): void{
    const song1 = this.versus[0];
    const song2 = this.versus[1];
    // comparar los votos
    if (song1.votes > song2.votes) {
      this.addSong(song1);
    } else {
      this.addSong(song2);
    }
  }
  // agregar cancion al playlist
  addSong(song: SongModel): void{
    if (this.songs && this.songs.length > 0) {
      this.songsRef.update([...this.songs, song]);
    } else {
      this.songsRef.update([song]);
    }
    // dejar que se siga postulando canciones
    this.nextRef.set(true);
    // habilitar los dos formularios
    this.enable1Ref.set(false);
    this.enable2Ref.set(false);
    // eliminar la cancion que no se usara de nuestro storage
    if (song.name !== this.versus[0].name) {
      this.storage.ref(this.versus[0].name + '-song').delete();
      this.storage.ref(this.versus[0].name + '-cover').delete();
    }
    if ( song.name !== this.versus[1].name ) {
      this.storage.ref(this.versus[1].name + '-song').delete();
      this.storage.ref(this.versus[1].name + '-cover').delete();
    }
    // quitar los links de canciones del versus
    this.versus[0].song = null;
    this.versus[1].song = null;
    this.versusRef.update(this.versus);
  }
}
