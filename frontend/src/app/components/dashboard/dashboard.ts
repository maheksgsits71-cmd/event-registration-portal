import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { UserService } from '../../services/user.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <!-- Welcome Header -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="display-5 fw-bold text-dark tracking-tight">Event Registration Dashboard</h1>
          <p class="text-muted fs-5">Manage events, track registrations, and coordinate participants all in one place.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <span class="badge bg-light text-dark border p-2 fs-6">
            <i class="bi bi-clock-history me-1 text-primary"></i> 
            {{ today | date:'fullDate' }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3">Fetching real-time metrics...</p>
      </div>

      <!-- Main Dashboard Grid -->
      <div *ngIf="!loading">
        <!-- Stats Row -->
        <div class="row g-4 mb-5">
          <!-- Total Events Card -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm overflow-hidden h-100 stat-card">
              <div class="card-body p-4 position-relative">
                <div class="d-flex align-items-center mb-3">
                  <div class="stat-icon bg-primary-subtle text-primary rounded-3 p-3 me-3">
                    <i class="bi bi-calendar3 fs-3"></i>
                  </div>
                  <div>
                    <h6 class="card-subtitle text-muted text-uppercase fw-semibold mb-1">Total Events</h6>
                    <h2 class="card-title fw-bold mb-0">{{ totalEvents }}</h2>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-4">
                  <a routerLink="/events" class="text-decoration-none text-primary fw-medium small">
                    View all events <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                  <span class="badge bg-success-subtle text-success">+{{ upcomingEventsCount }} upcoming</span>
                </div>
                <div class="card-gradient bg-primary"></div>
              </div>
            </div>
          </div>

          <!-- Total Registrations Card -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm overflow-hidden h-100 stat-card">
              <div class="card-body p-4 position-relative">
                <div class="d-flex align-items-center mb-3">
                  <div class="stat-icon bg-success-subtle text-success rounded-3 p-3 me-3">
                    <i class="bi bi-ticket-perforated fs-3"></i>
                  </div>
                  <div>
                    <h6 class="card-subtitle text-muted text-uppercase fw-semibold mb-1">Total Registrations</h6>
                    <h2 class="card-title fw-bold mb-0">{{ totalRegistrations }}</h2>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-4">
                  <a routerLink="/participants" class="text-decoration-none text-success fw-medium small">
                    Manage registrations <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                  <span class="badge bg-info-subtle text-info">{{ activeRegistrationsCount }} active</span>
                </div>
                <div class="card-gradient bg-success"></div>
              </div>
            </div>
          </div>

          <!-- Total Users/Participants Card -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm overflow-hidden h-100 stat-card">
              <div class="card-body p-4 position-relative">
                <div class="d-flex align-items-center mb-3">
                  <div class="stat-icon bg-info-subtle text-info rounded-3 p-3 me-3">
                    <i class="bi bi-people fs-3"></i>
                  </div>
                  <div>
                    <h6 class="card-subtitle text-muted text-uppercase fw-semibold mb-1">Total Users</h6>
                    <h2 class="card-title fw-bold mb-0">{{ totalUsers }}</h2>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-4">
                  <a routerLink="/register-participant" class="text-decoration-none text-info fw-medium small">
                    Register a user <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                  <span class="badge bg-warning-subtle text-warning">All Roles</span>
                </div>
                <div class="card-gradient bg-info"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Upcoming Events Column -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <h4 class="fw-bold text-dark mb-0">Upcoming Events</h4>
                <a routerLink="/events" class="btn btn-outline-primary btn-sm rounded-pill px-3">View All</a>
              </div>
              <div class="card-body p-4">
                <div *ngIf="upcomingEvents.length === 0" class="text-center py-5">
                  <i class="bi bi-calendar-x text-muted display-4 mb-3 d-block"></i>
                  <h5 class="text-muted fw-normal">No upcoming events scheduled</h5>
                  <p class="text-muted small">Create a new event to start taking registrations.</p>
                  <a routerLink="/events/create" class="btn btn-primary btn-sm rounded-pill mt-2">
                    <i class="bi bi-plus-lg me-1"></i> Create Event
                  </a>
                </div>

                <div *ngIf="upcomingEvents.length > 0" class="list-group list-group-flush gap-3">
                  <div *ngFor="let event of upcomingEvents" class="list-group-item border-0 p-3 rounded-3 bg-light-subtle shadow-sm-hover transition-all">
                    <div class="row align-items-center">
                      <!-- Event Date Badge -->
                      <div class="col-md-2 text-center border-end py-1">
                        <span class="d-block fw-bold text-primary fs-4">{{ event.eventDate | date:'d' }}</span>
                        <span class="d-block text-muted text-uppercase small">{{ event.eventDate | date:'MMM' }}</span>
                      </div>
                      <!-- Event Info -->
                      <div class="col-md-7 ps-md-4 mt-2 mt-md-0">
                        <h5 class="fw-bold text-dark mb-1">{{ event.eventName }}</h5>
                        <p class="text-muted small mb-2 text-truncate">{{ event.description || 'No description provided.' }}</p>
                        <div class="d-flex flex-wrap gap-3 text-muted small">
                          <span><i class="bi bi-clock me-1 text-primary"></i> {{ event.eventTime }}</span>
                          <span><i class="bi bi-geo-alt me-1 text-danger"></i> {{ event.venue || 'TBA' }}</span>
                          <span><i class="bi bi-people me-1 text-success"></i> Capacity: {{ event.capacity }}</span>
                        </div>
                      </div>
                      <!-- Event Actions -->
                      <div class="col-md-3 text-md-end mt-3 mt-md-0">
                        <a [routerLink]="['/register-participant']" [queryParams]="{eventId: event.eventId}" class="btn btn-primary btn-sm rounded-pill w-100 mb-2">
                          <i class="bi bi-plus-lg me-1"></i> Register
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions Panel -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100 bg-dark text-white">
              <div class="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <h4 class="fw-bold mb-3">Quick Actions</h4>
                  <p class="text-white-50 mb-4">Easily perform administrative actions across the event portal.</p>
                  
                  <div class="d-grid gap-3">
                    <a routerLink="/events/create" class="btn btn-outline-light d-flex align-items-center justify-content-between p-3 rounded-3 text-start transition-all hover-white">
                      <span>
                        <i class="bi bi-calendar-plus me-2 fs-5 text-primary"></i> 
                        Create New Event
                      </span>
                      <i class="bi bi-chevron-right"></i>
                    </a>
                    
                    <a routerLink="/register-participant" class="btn btn-outline-light d-flex align-items-center justify-content-between p-3 rounded-3 text-start transition-all hover-white">
                      <span>
                        <i class="bi bi-person-plus me-2 fs-5 text-success"></i> 
                        Register Participant
                      </span>
                      <i class="bi bi-chevron-right"></i>
                    </a>

                    <a routerLink="/participants" class="btn btn-outline-light d-flex align-items-center justify-content-between p-3 rounded-3 text-start transition-all hover-white">
                      <span>
                        <i class="bi bi-people me-2 fs-5 text-info"></i> 
                        View All Registrations
                      </span>
                      <i class="bi bi-chevron-right"></i>
                    </a>
                  </div>
                </div>
                
                <div class="mt-5 border-top border-secondary pt-4 text-center">
                  <div class="text-muted small">Event Management Portal v1.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-tight {
      letter-spacing: -0.5px;
    }
    .stat-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
    }
    .stat-icon {
      transition: transform 0.3s ease;
    }
    .stat-card:hover .stat-icon {
      transform: scale(1.1);
    }
    .card-gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      opacity: 0.8;
    }
    .shadow-sm-hover:hover {
      background-color: #fff !important;
      box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
    }
    .transition-all {
      transition: all 0.2s ease-in-out;
    }
    .hover-white:hover {
      background-color: rgba(255,255,255,0.1);
      color: #fff;
    }
    .bg-light-subtle {
      background-color: #f8f9fa;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  today = new Date();

  totalEvents = 0;
  totalRegistrations = 0;
  totalUsers = 0;
  upcomingEventsCount = 0;
  activeRegistrationsCount = 0;

  upcomingEvents: Event[] = [];

  constructor(
    private eventService: EventService,
    private registrationService: RegistrationService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('DashboardComponent: Constructor instantiated.');
  }

  ngOnInit(): void {
    console.log('DashboardComponent: ngOnInit triggered.');
    forkJoin({
      events: this.eventService.getAllEvents(),
      registrations: this.registrationService.getAll(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ events, registrations, users }) => {
        const eventsList = events || [];
        const registrationsList = registrations || [];
        const usersList = users || [];

        this.totalEvents = eventsList.length;
        this.totalRegistrations = registrationsList.length;
        this.totalUsers = usersList.length;

        // Parse and filter upcoming events safely
        const currentDateStr = new Date().toISOString().split('T')[0];
        
        this.upcomingEvents = eventsList.filter(e => {
          return e && e.eventDate && e.eventDate >= currentDateStr;
        }).sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''));

        this.upcomingEventsCount = this.upcomingEvents.length;
        
        this.activeRegistrationsCount = registrationsList.filter(r => r && r.status === 'REGISTERED').length;
        
        this.loading = false;
        console.log('DashboardComponent: Data loaded, triggering change detection.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
