import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { AsyncStorageEngine } from '../../../src/lib/symbols';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements AsyncStorageEngine {
  constructor(private storage: Storage) {}

  length(): Observable<number> {
    return from(this.storage.length());
  }

  getItem(key: any): Observable<any> {
    return from(this.storage.get(key));
  }

  setItem(key: any, val: any): void {
    this.storage.set(key, val);
  }

  removeItem(key: any): void {
    this.storage.remove(key);
  }

  clear(): void {
    this.storage.clear();
  }

  key(val: number): Observable<string> {
    return from(this.storage.keys().then(keys => keys[val]));
  }
}
