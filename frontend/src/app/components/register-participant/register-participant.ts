import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { Event } from '../../models/event.model';
import { Role } from '../../models/role.enum';
import { Status } from '../../models/status.enum';

@Component({
  selector: 'app-register-participant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <!-- Back Link -->
          <div class="mb-3">
            <a routerLink="/participants" class="text-decoration-none text-muted">
              <i class="bi bi-arrow-left me-1"></i> View Registrations
            </a>
          </div>

          <!-- Card Form -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-success-subtle text-success rounded-3 p-3 me-3">
                  <i class="bi bi-person-plus fs-3"></i>
                </div>
                <div>
                  <h2 class="fw-bold mb-0">Register Participant</h2>
                  <p class="text-muted mb-0">Sign up a participant for an event.</p>
                </div>
              </div>

              <!-- Loading State -->
              <div *ngIf="loading" class="text-center py-4">
                <div class="spinner-border text-success" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <div *ngIf="!loading">
                <!-- Tab Headers -->
                <ul class="nav nav-pills nav-fill mb-4 p-1 bg-light rounded-pill" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link rounded-pill py-2"
                      [class.active]="userFlow === 'existing'"
                      (click)="setFlow('existing')"
                      type="button"
                    >
                      <i class="bi bi-person-check me-1"></i> Existing User
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button
                      class="nav-link rounded-pill py-2"
                      [class.active]="userFlow === 'new'"
                      (click)="setFlow('new')"
                      type="button"
                    >
                      <i class="bi bi-person-plus me-1"></i> Create New User
                    </button>
                  </li>
                </ul>

                <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                  <!-- Event Selection -->
                  <div class="mb-4">
                    <label for="event" class="form-label fw-semibold">Select Event <span class="text-danger">*</span></label>
                    <select
                      id="event"
                      formControlName="event"
                      class="form-select"
                      [class.is-invalid]="isFieldInvalid('event')"
                    >
                      <option value="" disabled>Choose an event</option>
                      <option *ngFor="let ev of events" [ngValue]="ev">
                        {{ ev.eventName }} — {{ ev.eventDate }} (Capacity: {{ ev.capacity }})
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      Please select an event.
                    </div>
                  </div>

                  <!-- Existing User Form Section -->
                  <div *ngIf="userFlow === 'existing'" class="mb-4">
                    <label for="user" class="form-label fw-semibold">Select Participant <span class="text-danger">*</span></label>
                    <select
                      id="user"
                      formControlName="user"
                      class="form-select"
                      [class.is-invalid]="isFieldInvalid('user')"
                    >
                      <option value="" disabled>Choose a user</option>
                      <option *ngFor="let usr of users" [ngValue]="usr">
                        {{ usr.name }} ({{ usr.email }})
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      Please select a participant user.
                    </div>
                    <div class="form-text small" *ngIf="users.length === 0">
                      No users found. Please use the "Create New User" flow to add a participant.
                    </div>
                  </div>

                  <!-- New User Form Section -->
                  <div *ngIf="userFlow === 'new'" formGroupName="newUser" class="card bg-light border-0 p-4 rounded-3 mb-4">
                    <h5 class="fw-bold mb-3"><i class="bi bi-card-list me-1 text-primary"></i> Participant Details</h5>
                    
                    <!-- Name -->
                    <div class="mb-3">
                      <label for="name" class="form-label fw-semibold">Full Name <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        id="name"
                        formControlName="name"
                        class="form-control bg-white"
                        [class.is-invalid]="isNewUserFieldInvalid('name')"
                        placeholder="Enter full name"
                      />
                      <div class="invalid-feedback">
                        Full name is required.
                      </div>
                    </div>

                    <!-- Email -->
                    <div class="mb-3">
                      <label for="email" class="form-label fw-semibold">Email Address <span class="text-danger">*</span></label>
                      <input
                        type="email"
                        id="email"
                        formControlName="email"
                        class="form-control bg-white"
                        [class.is-invalid]="isNewUserFieldInvalid('email')"
                        placeholder="example@domain.com"
                      />
                      <div class="invalid-feedback">
                        Please provide a valid email.
                      </div>
                    </div>

                    <div class="row">
                      <!-- Phone -->
                      <div class="col-md-6 mb-3">
                        <label for="phone" class="form-label fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          formControlName="phone"
                          class="form-control bg-white"
                          placeholder="E.g., +1234567890"
                        />
                      </div>

                      <!-- Password -->
                      <div class="col-md-6 mb-3">
                        <label for="password" class="form-label fw-semibold">Password <span class="text-danger">*</span></label>
                        <input
                          type="password"
                          id="password"
                          formControlName="password"
                          class="form-control bg-white"
                          [class.is-invalid]="isNewUserFieldInvalid('password')"
                          placeholder="Choose password"
                        />
                        <div class="invalid-feedback">
                          Password is required (min 6 characters).
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Registration Status -->
                  <div class="mb-4">
                    <label for="status" class="form-label fw-semibold">Registration Status</label>
                    <select id="status" formControlName="status" class="form-select">
                      <option [value]="Status.REGISTERED">Registered</option>
                      <option [value]="Status.CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex justify-content-end gap-2 mt-4">
                    <a routerLink="/participants" class="btn btn-light rounded-pill px-4">Cancel</a>
                    <button type="submit" [disabled]="submitting" class="btn btn-success rounded-pill px-4">
                      <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Register Now
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterParticipantComponent implements OnInit {
  registerForm!: FormGroup;
  events: Event[] = [];
  users: User[] = [];
  loading = true;
  submitting = false;
  userFlow: 'existing' | 'new' = 'existing';
  Status = Status;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private userService: UserService,
    private registrationService: RegistrationService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('RegisterParticipantComponent: Constructor instantiated.');
  }

  ngOnInit(): void {
    console.log('RegisterParticipantComponent: ngOnInit triggered.');
    this.initForm();
    this.loadData();
  }

  private initForm() {
    this.registerForm = this.fb.group({
      event: ['', [Validators.required]],
      user: ['', [Validators.required]], // defaults to required since 'existing' flow starts
      status: [Status.REGISTERED, [Validators.required]],
      newUser: this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    });
    // Remove validators of newUser sub-group by default
    this.disableNewUserValidators();
  }

  private loadData() {
    console.log('RegisterParticipantComponent: loadData starting.');
    forkJoin({
      events: this.eventService.getAllEvents(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ events, users }) => {
        console.log('RegisterParticipantComponent: forkJoin next handler triggered. Events:', events, 'Users:', users);
        this.events = events || [];
        this.users = users || [];

        // Check for routing query params (e.g. from event cards)
        this.route.queryParams.subscribe(params => {
          const eventId = params['eventId'];
          console.log('RegisterParticipantComponent: queryParams parsed:', params);
          if (eventId) {
            const selectedEvent = this.events.find(e => e.eventId === +eventId);
            console.log('RegisterParticipantComponent: found selected event:', selectedEvent);
            if (selectedEvent) {
              this.registerForm.patchValue({ event: selectedEvent });
            }
          }
        });

        this.loading = false;
        console.log('RegisterParticipantComponent: Finished data load setting loading = false.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('RegisterParticipantComponent: forkJoin error handler triggered:', err);
        this.notification.showError('Could not load events and users.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFlow(flow: 'existing' | 'new') {
    this.userFlow = flow;
    if (flow === 'existing') {
      this.registerForm.get('user')?.setValidators([Validators.required]);
      this.disableNewUserValidators();
    } else {
      this.registerForm.get('user')?.clearValidators();
      this.enableNewUserValidators();
    }
    this.registerForm.get('user')?.updateValueAndValidity();
    this.registerForm.get('newUser')?.updateValueAndValidity();
  }

  private disableNewUserValidators() {
    const newUserGroup = this.registerForm.get('newUser') as FormGroup;
    Object.keys(newUserGroup.controls).forEach(key => {
      newUserGroup.get(key)?.clearValidators();
      newUserGroup.get(key)?.updateValueAndValidity();
    });
  }

  private enableNewUserValidators() {
    const newUserGroup = this.registerForm.get('newUser') as FormGroup;
    newUserGroup.get('name')?.setValidators([Validators.required]);
    newUserGroup.get('email')?.setValidators([Validators.required, Validators.email]);
    newUserGroup.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    
    Object.keys(newUserGroup.controls).forEach(key => {
      newUserGroup.get(key)?.updateValueAndValidity();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  isNewUserFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get('newUser')?.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.registerForm.value;

    if (this.userFlow === 'existing') {
      this.submitRegistration(formValue.user, formValue.event, formValue.status);
    } else {
      // Flow for new user creation first
      const newParticipant: User = {
        name: formValue.newUser.name,
        email: formValue.newUser.email,
        phone: formValue.newUser.phone || null,
        password: formValue.newUser.password,
        role: Role.PARTICIPANT,
        createdAt: new Date().toISOString().split('.')[0]
      };

      this.userService.register(newParticipant).subscribe({
        next: (savedUser) => {
          this.submitRegistration(savedUser, formValue.event, formValue.status);
        },
        error: (err) => {
          console.error('Error creating user during registration', err);
          this.notification.showError(err.error?.message || 'Could not register new user. Email might be in use.');
          this.submitting = false;
        }
      });
    }
  }

  private submitRegistration(user: User, event: Event, status: Status) {
    const registrationPayload = {
      user: {
        userId: user.userId
      },
      event: {
        eventId: event.eventId
      },
      registrationDate: new Date().toISOString().split('.')[0],
      status: status
    };

    this.registrationService.register(registrationPayload as any).subscribe({
      next: () => {
        this.notification.showSuccess('Participant registered successfully!');
        this.router.navigate(['/participants']);
      },
      error: (err) => {
        console.error('Error submitting registration', err);
        this.notification.showError(err.error?.message || 'Error occurred while registering participant.');
        this.submitting = false;
      }
    });
  }
}
