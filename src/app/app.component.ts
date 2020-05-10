import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularMapsAPIintegration';

  constructor(private auth: AuthService, private router: Router) {
    this.auth.anonymousLogin();
    this.router.navigate(['/map']);
  }
}
