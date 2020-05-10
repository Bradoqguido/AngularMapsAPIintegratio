import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState: any = null;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private afs: AngularFirestore) {

              this.afAuth.onAuthStateChanged(firebaseUser => {
                this.authState = firebaseUser;
                this.updateUserData();
              });
  }


  // Returns true if user is logged in
  get authenticated(): boolean {
    return this.authState !== null;
  }

  // Returns current user data
  get currentUser(): any {
    return this.authenticated ? this.authState : null;
  }

  // Returns
  get currentUserObservable(): any {
    return this.afAuth.authState;
  }

  // Returns current user UID
  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  // Anonymous User
  get currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false;
  }

  //// Anonymous Auth ////

  async anonymousLogin() {
    await this.afAuth.signInAnonymously()
    .then(userRawData => {
      this.authState = userRawData.user;
    });
  }

  // sign out to home
  async signOut() {
    await this.afAuth.signOut();
    return this.router.navigate(['']);
  }

  //// Helpers ////

  private async updateUserData() {
    // Captura Referencia do documento no firestore
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${this.currentUserId}`);

    // Captura os dados
    const data = {
      uid: this.authState.uid,
      email: this.authState.email,
      displayName: this.authState.displayName,
      photoURL: this.authState.photoURL
    };

    // Atualiza a base, mas so atualiza os dados alterados e recarrega a pagina
    return userRef.set(data, {merge: true});
  }
}
