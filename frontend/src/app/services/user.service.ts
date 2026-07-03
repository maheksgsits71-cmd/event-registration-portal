import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { API_BASE_URL } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  register(user: User): Observable<User> {
    console.log('UserService: Registering user...', user);
    return this.http.post<User>(`${this.apiUrl}/register`, user).pipe(
      tap(res => console.log('UserService: Registered successfully:', res)),
      catchError(err => {
        console.error('UserService: Error registering user:', err);
        return throwError(() => err);
      })
    );
  }

  getAllUsers(): Observable<User[]> {
    console.log('UserService: Requesting all users from:', this.apiUrl);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(data => console.log('UserService: Received users:', data)),
      catchError(err => {
        console.error('UserService: Error fetching users:', err);
        return throwError(() => err);
      })
    );
  }
}
