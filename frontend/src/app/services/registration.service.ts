import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Registration } from '../models/registration.model';
import { API_BASE_URL } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = `${API_BASE_URL}/registrations`;

  constructor(private http: HttpClient) {}

  register(registration: Registration): Observable<Registration> {
    console.log('RegistrationService: Submitting registration...', registration);
    return this.http.post<Registration>(this.apiUrl, registration).pipe(
      tap(res => console.log('RegistrationService: Registration created:', res)),
      catchError(err => {
        console.error('RegistrationService: Error submitting registration:', err);
        return throwError(() => err);
      })
    );
  }

  getAll(): Observable<Registration[]> {
    console.log('RegistrationService: Requesting all registrations from:', this.apiUrl);
    return this.http.get<Registration[]>(this.apiUrl).pipe(
      tap(data => console.log('RegistrationService: Received registrations:', data)),
      catchError(err => {
        console.error('RegistrationService: Error fetching registrations:', err);
        return throwError(() => err);
      })
    );
  }

  getByEvent(eventId: number): Observable<Registration[]> {
    console.log('RegistrationService: Requesting registrations for event ID:', eventId);
    return this.http.get<Registration[]>(`${this.apiUrl}/event/${eventId}`).pipe(
      tap(data => console.log(`RegistrationService: Received registrations for event ${eventId}:`, data)),
      catchError(err => {
        console.error(`RegistrationService: Error fetching registrations for event ${eventId}:`, err);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<Registration> {
    console.log('RegistrationService: Requesting registration details for ID:', id);
    return this.http.get<Registration>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.log(`RegistrationService: Received registration ID ${id}:`, data)),
      catchError(err => {
        console.error(`RegistrationService: Error fetching registration ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<void> {
    console.log('RegistrationService: Deleting registration ID:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log(`RegistrationService: Deleted registration ID ${id} successfully`)),
      catchError(err => {
        console.error(`RegistrationService: Error deleting registration ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
