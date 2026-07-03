import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <!-- Back Link -->
          <div class="mb-3">
            <a routerLink="/events" class="text-decoration-none text-muted">
              <i class="bi bi-arrow-left me-1"></i> Back to Events List
            </a>
          </div>

          <!-- Card Form -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-primary-subtle text-primary rounded-3 p-3 me-3">
                  <i class="bi bi-calendar-plus fs-3"></i>
                </div>
                <div>
                  <h2 class="fw-bold mb-0">Create Event</h2>
                  <p class="text-muted mb-0">Fill in the details below to schedule a new event.</p>
                </div>
              </div>

              <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
                <!-- Event Name -->
                <div class="mb-3">
                  <label for="eventName" class="form-label fw-semibold">Event Name <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    id="eventName"
                    formControlName="eventName"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('eventName')"
                    placeholder="Enter event name"
                  />
                  <div class="invalid-feedback" *ngIf="eventForm.get('eventName')?.errors?.['required']">
                    Event name is required.
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label for="description" class="form-label fw-semibold">Description</label>
                  <textarea
                    id="description"
                    formControlName="description"
                    class="form-control"
                    rows="3"
                    placeholder="Describe the event details..."
                  ></textarea>
                </div>

                <div class="row">
                  <!-- Event Date -->
                  <div class="col-md-6 mb-3">
                    <label for="eventDate" class="form-label fw-semibold">Event Date <span class="text-danger">*</span></label>
                    <input
                      type="date"
                      id="eventDate"
                      formControlName="eventDate"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('eventDate')"
                    />
                    <div class="invalid-feedback" *ngIf="eventForm.get('eventDate')?.errors?.['required']">
                      Event date is required.
                    </div>
                  </div>

                  <!-- Event Time -->
                  <div class="col-md-6 mb-3">
                    <label for="eventTime" class="form-label fw-semibold">Event Time <span class="text-danger">*</span></label>
                    <input
                      type="time"
                      id="eventTime"
                      formControlName="eventTime"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('eventTime')"
                      step="1"
                    />
                    <div class="invalid-feedback" *ngIf="eventForm.get('eventTime')?.errors?.['required']">
                      Event time is required.
                    </div>
                  </div>
                </div>

                <div class="row">
                  <!-- Venue -->
                  <div class="col-md-6 mb-3">
                    <label for="venue" class="form-label fw-semibold">Venue</label>
                    <input
                      type="text"
                      id="venue"
                      formControlName="venue"
                      class="form-control"
                      placeholder="E.g., Conference Hall A"
                    />
                  </div>

                  <!-- Capacity -->
                  <div class="col-md-6 mb-3">
                    <label for="capacity" class="form-label fw-semibold">Capacity <span class="text-danger">*</span></label>
                    <input
                      type="number"
                      id="capacity"
                      formControlName="capacity"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('capacity')"
                      placeholder="E.g., 100"
                    />
                    <div class="invalid-feedback" *ngIf="eventForm.get('capacity')?.errors?.['required']">
                      Capacity is required.
                    </div>
                    <div class="invalid-feedback" *ngIf="eventForm.get('capacity')?.errors?.['min']">
                      Capacity must be at least 1.
                    </div>
                  </div>
                </div>



                <!-- Submit Buttons -->
                <div class="d-flex justify-content-end gap-2 mt-4">
                  <a routerLink="/events" class="btn btn-light rounded-pill px-4">Cancel</a>
                  <button type="submit" [disabled]="submitting" class="btn btn-primary rounded-pill px-4">
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EventCreateComponent implements OnInit {
  eventForm!: FormGroup;
  users: User[] = [];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private userService: UserService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  private initForm() {
    this.eventForm = this.fb.group({
      eventName: ['', [Validators.required]],
      description: [''],
      eventDate: ['', [Validators.required]],
      eventTime: ['', [Validators.required]],
      venue: [''],
      capacity: ['', [Validators.required, Validators.min(1)]],
      createdBy: ['', [Validators.required]]
    });
  }

  private loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        // Find organizers or all users (backend uses createdBy user, which is any User)
        this.users = data;
        
        // Auto-select first admin or user if available
        const defaultUser = data.find(u => u.role === 'ADMIN') || data[0];
        if (defaultUser) {
          this.eventForm.patchValue({ createdBy: defaultUser });
        }
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.notification.showError('Could not load users database.');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.eventForm.value;
    
    // Format local time to HH:mm:ss if needed. HTML time input is HH:mm.
    let timeStr = formValue.eventTime;
    if (timeStr && timeStr.split(':').length === 2) {
      timeStr = `${timeStr}:00`;
    }

    const payload = {
      ...formValue,
      eventTime: timeStr
    };

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.notification.showSuccess('Event created successfully!');
        this.router.navigate(['/events']);
      },
      error: (err) => {
        console.error('Error creating event', err);
        this.notification.showError(err.error?.message || 'Error occurred while saving the event.');
        this.submitting = false;
      }
    });
  }
}
