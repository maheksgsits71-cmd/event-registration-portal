import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar';
import { NotificationService, AlertMessage } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  alerts: AlertMessage[] = [];

  constructor(private notification: NotificationService) {}

  ngOnInit() {
    this.notification.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  removeAlert(alert: AlertMessage) {
    this.notification.removeAlert(alert);
  }
}
