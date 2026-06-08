import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ToastrService } from 'ngx-toastr';

import { Navbar } from '../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { AppointmentService } from '../../../core/services/appointment';
import { AppointmentDialog } from '../appointment-dialog/appointment-dialog';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    Navbar,
    Sidebar
  ],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentList implements OnInit {

  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  role: string | null = null;

  appointments: any[] = [];
  filteredAppointments: any[] = [];

  searchText = '';
  isLoading = false;

  displayedColumns: string[] = [
    'appointmentId',
    'patientId',
    'doctorEmployeeId',
    'date',
    'timeSlot',
    'status'
  ];

  ngOnInit(): void {
    this.role = this.authService.getRole();

    if (this.role !== 'DOCTOR') {
      this.displayedColumns = [
        ...this.displayedColumns,
        'actions'
      ];
    }

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;

    this.appointmentService.getAppointments().subscribe({
      next: (response) => {
        this.appointments = response?.data || [];
        this.filteredAppointments = [...this.appointments];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load appointments');
        this.cdr.markForCheck();
      }
    });
  }

  applySearch(): void {
    const value = this.searchText.toLowerCase().trim();

    if (!value) {
      this.filteredAppointments = [...this.appointments];
      return;
    }

    this.filteredAppointments = this.appointments.filter((a) =>
      a.appointmentId?.toLowerCase().includes(value) ||
      a.patientId?.toLowerCase().includes(value) ||
      a.doctorEmployeeId?.toLowerCase().includes(value) ||
      a.timeSlot?.toLowerCase().includes(value) ||
      a.status?.toLowerCase().includes(value)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredAppointments = [...this.appointments];
  }

  getStatusCount(status: string): number {
    return this.appointments.filter(
      appointment => appointment.status === status
    ).length;
  }

  openAddDialog(): void {
    if (this.role === 'DOCTOR') {
      this.toastr.error('Doctors are not allowed to create appointments');
      return;
    }

    const ref = this.dialog.open(AppointmentDialog, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  deleteAppointment(appointment: any): void {
    if (this.role === 'DOCTOR') {
      this.toastr.error('Doctors are not allowed to delete appointments');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete appointment ${appointment.appointmentId}?`
    );

    if (!confirmed) return;

    this.appointmentService
      .deleteAppointment(appointment.appointmentId)
      .subscribe({
        next: () => {
          this.toastr.success('Appointment deleted successfully');
          this.loadAppointments();
        },
        error: (err) => {
          this.toastr.error(
            err?.error?.message || 'Delete failed'
          );
        }
      });
  }
}