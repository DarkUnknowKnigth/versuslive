import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private storage: AngularFireStorage) { }
  public upload(name: string, data: any): AngularFireUploadTask{
    return this.storage.upload(name, data);
  }
  public refOfCloud(name: string): AngularFireStorageReference{
    return this.storage.ref(name);
  }
}
