import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { EventListComponent } from './components/event-list/event-list';
import { EventCreateComponent } from './components/event-create/event-create';
import { RegisterParticipantComponent } from './components/register-participant/register-participant';
import { ParticipantListComponent } from './components/participant-list/participant-list';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/create', component: EventCreateComponent },
  { path: 'register-participant', component: RegisterParticipantComponent },
  { path: 'participants', component: ParticipantListComponent },
  { path: '**', redirectTo: '' }
];
