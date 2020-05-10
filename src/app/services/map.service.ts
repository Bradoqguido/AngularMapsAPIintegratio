import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IGeoJson } from '../models/map';

@Injectable()
export class MapService {

  constructor(private db: AngularFirestore) { }

  async getMarkers() {
    return this.db.collection('/markers').valueChanges();
  }

  async createMarker(data: IGeoJson) {
    this.db.collection('/markers').add(data)
    .then(res => {
      data.$key = res.id;
      this.db.collection('/markers').doc(res.id).update(data);
    });
  }

  async removeMarker($key: string) {
    return this.db.collection('/markers').doc($key).delete();
  }

}
