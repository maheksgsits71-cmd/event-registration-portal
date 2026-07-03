import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <i class="bi bi-calendar-event-fill text-primary me-2 fs-3"></i>
          <span class="fw-bold tracking-tight">EventPortal</span>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
            <li class="nav-item">
              <a class="nav-link px-3 rounded-pill d-flex align-items-center gap-2" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-speedometer2"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-pill d-flex align-items-center gap-2" routerLink="/events" routerLinkActive="active">
                <i class="bi bi-calendar3"></i> Events
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-pill d-flex align-items-center gap-2" routerLink="/events/create" routerLinkActive="active">
                <i class="bi bi-calendar-plus"></i> Create Event
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-pill d-flex align-items-center gap-2" routerLink="/register-participant" routerLinkActive="active">
                <i class="bi bi-person-plus"></i> Register Participant
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-pill d-flex align-items-center gap-2" routerLink="/participants" routerLinkActive="active">
                <i class="bi bi-people"></i> Participants
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      color: rgba(255,255,255,0.7) !important;
      transition: all 0.2s ease-in-out;
    }
    .nav-link:hover {
      color: #fff !important;
      background-color: rgba(255,255,255,0.1);
    }
    .nav-link.active {
      color: #fff !important;
      background-color: var(--bs-primary) !important;
      font-weight: 500;
    }
    .tracking-tight {
      letter-spacing: -0.5px;
    }
  `]
})
export class NavbarComponent {}
