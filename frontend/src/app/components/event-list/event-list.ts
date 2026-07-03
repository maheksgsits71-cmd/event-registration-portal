import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { Event } from '../../models/event.model';

interface EventWithCounts extends Event {
  registeredCount: number;
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="row mb-4 align-items-center">
        <div class="col-sm-6">
          <h1 class="display-6 fw-bold text-dark mb-1">Events Directory</h1>
          <p class="text-muted">Browse scheduled events and monitor their capacities.</p>
        </div>
        <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
          <a routerLink="/events/create" class="btn btn-primary rounded-pill px-4">
            <i class="bi bi-calendar-plus me-1"></i> Create Event
          </a>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3">
          <div class="row g-2 align-items-center">
            <!-- Search bar -->
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text bg-transparent border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="filterEvents()"
                  class="form-control border-start-0 ps-0"
                  placeholder="Search events by name, venue, or description..."
                />
              </div>
            </div>
            <!-- Filter options -->
            <div class="col-md-4">
              <select
                [(ngModel)]="selectedFilter"
                (ngModelChange)="filterEvents()"
                class="form-select"
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Events Only</option>
                <option value="past">Past Events Only</option>
                <option value="full">Fully Booked Only</option>
                <option value="available">Spots Available Only</option>
              </select>
            </div>
            <div class="col-md-2">
              <button (click)="resetFilters()" class="btn btn-light w-100 rounded-3">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3">Fetching events database...</p>
      </div>

      <!-- Content State -->
      <div *ngIf="!loading">
        <!-- Empty State -->
        <div *ngIf="filteredEvents.length === 0" class="text-center py-5 bg-white rounded-3 shadow-sm">
          <i class="bi bi-calendar-x text-muted display-3 mb-3 d-block"></i>
          <h4 class="text-dark fw-bold">No events match your criteria</h4>
          <p class="text-muted max-width-md mx-auto">Try clearing search filters or create a new event to begin scheduling.</p>
          <button (click)="resetFilters()" class="btn btn-primary rounded-pill px-4 mt-2">Clear Filters</button>
        </div>

        <!-- Grid Cards -->
        <div *ngIf="filteredEvents.length > 0" class="row g-4">
          <div *ngFor="let event of filteredEvents" class="col-md-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100 event-card overflow-hidden">
              <!-- Card Header Gradient -->
              <div class="card-gradient bg-primary"></div>
              
              <div class="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="badge bg-light text-dark border d-flex align-items-center">
                      <i class="bi bi-calendar-check text-primary me-1"></i> {{ event.eventDate }}
                    </span>
                    <span
                      class="badge"
                      [ngClass]="{
                        'bg-danger-subtle text-danger': event.registeredCount >= event.capacity,
                        'bg-success-subtle text-success': event.registeredCount < event.capacity
                      }"
                    >
                      {{ event.registeredCount >= event.capacity ? 'Fully Booked' : (event.capacity - event.registeredCount) + ' Spots Left' }}
                    </span>
                  </div>

                  <h4 class="fw-bold text-dark card-title mb-2">{{ event.eventName }}</h4>
                  <p class="text-muted small description-text mb-4">
                    {{ event.description || 'No description provided for this event.' }}
                  </p>

                  <!-- Details List -->
                  <div class="d-flex flex-column gap-2 mb-4">
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-clock me-2 text-primary"></i>
                      <span>{{ event.eventTime }}</span>
                    </div>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-geo-alt me-2 text-danger"></i>
                      <span>{{ event.venue || 'To Be Announced' }}</span>
                    </div>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-person-badge me-2 text-info"></i>
                      <span>Organizer: {{ event.createdBy?.name || 'Unknown' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Footer Operations -->
                <div>
                  <!-- Progress Bar -->
                  <div class="mb-3">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                      <span>Registrations</span>
                      <span>{{ event.registeredCount }} / {{ event.capacity }} ({{ getCapacityPercentage(event) }}%)</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        [style.width.%]="getCapacityPercentage(event)"
                        [ngClass]="{
                          'bg-danger': getCapacityPercentage(event) >= 100,
                          'bg-warning': getCapacityPercentage(event) >= 80 && getCapacityPercentage(event) < 100,
                          'bg-success': getCapacityPercentage(event) < 80
                        }"
                      ></div>
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <a [routerLink]="['/register-participant']" [queryParams]="{eventId: event.eventId}" class="btn btn-outline-primary btn-sm rounded-pill flex-grow-1">
                      <i class="bi bi-person-plus me-1"></i> Register
                    </a>
                    <button
                      (click)="onDelete(event.eventId!)"
                      class="btn btn-outline-danger btn-sm rounded-circle px-2"
                      title="Delete Event"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .event-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      position: relative;
    }
    .event-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.06) !important;
    }
    .card-gradient {
      height: 4px;
      width: 100%;
    }
    .description-text {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 3.6em;
    }
    .max-width-md {
      max-width: 450px;
    }
  `]
})
export class EventListComponent implements OnInit {
  allEvents: EventWithCounts[] = [];
  filteredEvents: EventWithCounts[] = [];
  loading = true;

  searchQuery = '';
  selectedFilter = 'all';

  constructor(
    private eventService: EventService,
    private registrationService: RegistrationService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    forkJoin({
      events: this.eventService.getAllEvents(),
      registrations: this.registrationService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ events, registrations }) => {
        // Map active registrations to their event ID
        const activeRegsCountMap = new Map<number, number>();
        const registrationsList = registrations || [];
        const eventsList = events || [];

        registrationsList.forEach(r => {
          if (r && r.event?.eventId && r.status === 'REGISTERED') {
            const current = activeRegsCountMap.get(r.event.eventId) || 0;
            activeRegsCountMap.set(r.event.eventId, current + 1);
          }
        });

        this.allEvents = eventsList.map(event => ({
          ...event,
          registeredCount: activeRegsCountMap.get(event.eventId!) || 0
        }));

        this.filterEvents();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading events', err);
        this.notification.showError('Could not load events directory.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterEvents() {
    let result = [...this.allEvents];
    const query = this.searchQuery.toLowerCase().trim();
    const currentDateStr = new Date().toISOString().split('T')[0];

    // Search query matching
    if (query) {
      result = result.filter(e =>
        e.eventName.toLowerCase().includes(query) ||
        (e.venue && e.venue.toLowerCase().includes(query)) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
    }

    // Category filtering
    if (this.selectedFilter === 'upcoming') {
      result = result.filter(e => e.eventDate >= currentDateStr);
    } else if (this.selectedFilter === 'past') {
      result = result.filter(e => e.eventDate < currentDateStr);
    } else if (this.selectedFilter === 'full') {
      result = result.filter(e => e.registeredCount >= e.capacity);
    } else if (this.selectedFilter === 'available') {
      result = result.filter(e => e.registeredCount < e.capacity);
    }

    this.filteredEvents = result;
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedFilter = 'all';
    this.filterEvents();
  }

  getCapacityPercentage(event: EventWithCounts): number {
    if (!event.capacity) return 0;
    return Math.min(Math.round((event.registeredCount / event.capacity) * 100), 100);
  }

  onDelete(eventId: number) {
    if (confirm('Are you sure you want to delete this event? All associated registrations will also be affected.')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: (response) => {
          this.notification.showSuccess(response || 'Event deleted successfully.');
          this.loadEvents(); // Reload and re-calculate counts
        },
        error: (err) => {
          console.error('Error deleting event', err);
          this.notification.showError('Failed to delete the event. Check for active database references.');
        }
      });
    }
  }
}
