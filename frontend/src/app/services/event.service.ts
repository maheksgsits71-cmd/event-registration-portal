import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Event } from '../models/event.model';
import { API_BASE_URL } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${API_BASE_URL}/events`;

  constructor(private http: HttpClient) {}

  createEvent(event: Event): Observable<Event> {
    console.log('EventService: Creating event...', event);
    return this.http.post<Event>(this.apiUrl, event).pipe(
      tap(res => console.log('EventService: Event created successfully:', res)),
      catchError(err => {
        console.error('EventService: Error creating event:', err);
        return throwError(() => err);
      })
    );
  }

  getAllEvents(): Observable<Event[]> {
    console.log('EventService: Requesting all events from:', this.apiUrl);
    return this.http.get<Event[]>(this.apiUrl).pipe(
      tap(data => console.log('EventService: Received events:', data)),
      catchError(err => {
        console.error('EventService: Error fetching events:', err);
        return throwError(() => err);
      })
    );
  }

  getEvent(id: number): Observable<Event> {
    console.log('EventService: Requesting event ID:', id);
    return this.http.get<Event>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.log('EventService: Received event details:', data)),
      catchError(err => {
        console.error(`EventService: Error fetching event ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  deleteEvent(id: number): Observable<string> {
    console.log('EventService: Deleting event ID:', id);
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      tap(res => console.log('EventService: Deleted event result:', res)),
      catchError(err => {
        console.error(`EventService: Error deleting event ID ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
