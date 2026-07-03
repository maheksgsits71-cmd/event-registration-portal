import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { Registration } from '../../models/registration.model';
import { Status } from '../../models/status.enum';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container py-4">
      <!-- Header -->
      <div class="row mb-4 align-items-center">
        <div class="col-sm-6">
          <h1 class="display-6 fw-bold text-dark mb-1">Registrations Manager</h1>
          <p class="text-muted">Track event check-ins, cancel or manage active registrations.</p>
        </div>
        <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
          <a routerLink="/register-participant" class="btn btn-success rounded-pill px-4">
            <i class="bi bi-person-plus me-1"></i> Register Participant
          </a>
        </div>
      </div>

      <!-- Filters & Search -->
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
                  (ngModelChange)="filterRegistrations()"
                  class="form-control border-start-0 ps-0"
                  placeholder="Search by participant name, email, or event name..."
                />
              </div>
            </div>
            <!-- Status filter -->
            <div class="col-md-4">
              <select
                [(ngModel)]="selectedStatusFilter"
                (ngModelChange)="filterRegistrations()"
                class="form-select"
              >
                <option value="all">All Registrations</option>
                <option [value]="Status.REGISTERED">Registered Only</option>
                <option [value]="Status.CANCELLED">Cancelled Only</option>
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
        <div class="spinner-border text-success" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3">Fetching registration database...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!loading">
        <!-- Empty State -->
        <div *ngIf="filteredRegistrations.length === 0" class="text-center py-5 bg-white rounded-3 shadow-sm">
          <i class="bi bi-ticket-x text-muted display-3 mb-3 d-block"></i>
          <h4 class="text-dark fw-bold">No registrations found</h4>
          <p class="text-muted max-width-md mx-auto">Either no check-ins match your search parameters, or the database is currently empty.</p>
          <button (click)="resetFilters()" class="btn btn-success rounded-pill px-4 mt-2">Clear Filters</button>
        </div>

        <!-- Table Grid -->
        <div *ngIf="filteredRegistrations.length > 0" class="card border-0 shadow-sm overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-muted uppercase font-semibold text-xs border-bottom">
                <tr>
                  <th scope="col" class="px-4 py-3">ID</th>
                  <th scope="col" class="py-3">Participant</th>
                  <th scope="col" class="py-3">Event Name</th>
                  <th scope="col" class="py-3">Date Registered</th>
                  <th scope="col" class="py-3">Status</th>
                  <th scope="col" class="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reg of filteredRegistrations" class="transition-all">
                  <!-- Reg ID -->
                  <td class="px-4 fw-bold text-muted">#{{ reg.registrationId }}</td>
                  
                  <!-- Participant User Details -->
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar bg-primary-subtle text-primary fw-bold me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        {{ getInitials(reg.user?.name) }}
                      </div>
                      <div>
                        <h6 class="fw-bold mb-0 text-dark">{{ reg.user?.name || 'N/A' }}</h6>
                        <span class="text-muted small d-block">{{ reg.user?.email || 'N/A' }}</span>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Event Details -->
                  <td>
                    <span class="fw-medium text-dark d-block">{{ reg.event.eventName }}</span>
                    <span class="text-muted small d-flex align-items-center">
                      <i class="bi bi-calendar-event me-1 text-primary"></i> {{ reg.event.eventDate }}
                    </span>
                  </td>
                  
                  <!-- Date Registered -->
                  <td class="text-muted small">
                    {{ reg.registrationDate | date:'medium' }}
                  </td>
                  
                  <!-- Status -->
                  <td>
                    <span
                      class="badge"
                      [ngClass]="{
                        'bg-success-subtle text-success': reg.status === Status.REGISTERED,
                        'bg-danger-subtle text-danger': reg.status === Status.CANCELLED
                      }"
                    >
                      {{ reg.status === Status.REGISTERED ? 'Registered' : 'Cancelled' }}
                    </span>
                  </td>
                  
                  <!-- Action Buttons -->
                  <td class="px-4 text-end">
                    <div class="d-flex gap-2 justify-content-end">
                      <button
                        *ngIf="reg.status === Status.REGISTERED"
                        (click)="onCancelRegistration(reg)"
                        class="btn btn-outline-warning btn-sm rounded-pill px-3"
                        title="Cancel Registration"
                      >
                        <i class="bi bi-x-circle me-1"></i> Cancel
                      </button>
                      
                      <button
                        (click)="onDelete(reg.registrationId!)"
                        class="btn btn-outline-danger btn-sm rounded-circle px-2"
                        title="Delete Registration"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transition-all {
      transition: background-color 0.15s ease-in-out;
    }
    .avatar {
      font-size: 0.9rem;
      letter-spacing: -0.5px;
    }
    .max-width-md {
      max-width: 450px;
    }
  `]
})
export class ParticipantListComponent implements OnInit {
  registrations: Registration[] = [];
  filteredRegistrations: Registration[] = [];
  loading = true;
  Status = Status;

  searchQuery = '';
  selectedStatusFilter = 'all';

  constructor(
    private registrationService: RegistrationService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.loading = true;
    this.registrationService.getAll().subscribe({
      next: (data) => {
        const dataList = data || [];
        this.registrations = dataList.sort((a, b) => (b.registrationId || 0) - (a.registrationId || 0));
        this.filterRegistrations();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading registrations', err);
        this.notification.showError('Could not load participants registration database.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterRegistrations() {
    let result = [...this.registrations];
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      result = result.filter(r =>
        (r.user && r.user.name.toLowerCase().includes(query)) ||
        (r.user && r.user.email.toLowerCase().includes(query)) ||
        r.event.eventName.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatusFilter !== 'all') {
      result = result.filter(r => r.status === this.selectedStatusFilter);
    }

    this.filteredRegistrations = result;
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedStatusFilter = 'all';
    this.filterRegistrations();
  }

  getInitials(name?: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onCancelRegistration(reg: Registration) {
    if (confirm(`Are you sure you want to cancel ${reg.user?.name}'s registration for ${reg.event.eventName}?`)) {
      const updatedPayload: Registration = {
        ...reg,
        status: Status.CANCELLED
      };

      // Since update is not explicitly supported by a custom PUT mapping, but register is a save operation in the service,
      // let's see if saving it again updates it. Yes, saving an entity with its ID set will execute an update in JPA!
      // In RegistrationController.java, @PostMapping /registrations calls save(registration).
      // Since registration has its registrationId, JPA will do an update. This matches the backend perfectly!
      this.registrationService.register(updatedPayload).subscribe({
        next: () => {
          this.notification.showSuccess('Registration status cancelled.');
          this.loadRegistrations();
        },
        error: (err) => {
          console.error('Error cancelling registration', err);
          this.notification.showError('Failed to change registration status.');
        }
      });
    }
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this registration record permanently?')) {
      this.registrationService.delete(id).subscribe({
        next: () => {
          this.notification.showSuccess('Registration record deleted.');
          this.loadRegistrations();
        },
        error: (err) => {
          console.error('Error deleting registration', err);
          this.notification.showError('Failed to delete registration record.');
        }
      });
    }
  }
}
