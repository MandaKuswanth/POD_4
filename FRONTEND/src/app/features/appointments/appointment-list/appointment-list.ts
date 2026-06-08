import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    Sidebar,
  ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css',
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

  expandedAppointment: any = null;

  displayedColumns: string[] = [
    'appointmentId',
    'patientId',
    'doctorEmployeeId',
    'date',
    'timeSlot',
    'status',
  ];

  ngOnInit(): void {
    this.role = this.authService.getRole()?.toUpperCase() || null;
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.expandedAppointment = null;
    this.cdr.markForCheck();

    this.appointmentService.getAppointments().subscribe({
      next: (response: any) => {
        console.log('APPOINTMENT RESPONSE:', response);

        let appointments: any[] = [];

        if (Array.isArray(response?.data)) {
          appointments = response.data;
        } else if (Array.isArray(response)) {
          appointments = response;
        }

        this.appointments = appointments;
        this.filteredAppointments = [...appointments];

        this.isLoading = false;
        this.expandedAppointment = null;

        console.log('APPOINTMENTS ARRAY:', this.appointments);

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('APPOINTMENT LIST ERROR:', error);

        this.isLoading = false;
        this.appointments = [];
        this.filteredAppointments = [];
        this.expandedAppointment = null;

        this.toastr.error(
          error?.error?.message || 'Failed to load appointments'
        );

        this.cdr.markForCheck();
      },
    });
  }

  applySearch(): void {
    const value = this.searchText.toLowerCase().trim();

    if (!value) {
      this.filteredAppointments = [...this.appointments];
      this.expandedAppointment = null;
      this.cdr.markForCheck();
      return;
    }

    this.filteredAppointments = this.appointments.filter((appointment: any) =>
      appointment.appointmentId?.toLowerCase().includes(value) ||
      appointment.patientId?.toLowerCase().includes(value) ||
      appointment.patientName?.toLowerCase().includes(value) ||
      appointment.patientPhone?.toLowerCase().includes(value) ||
      appointment.doctorEmployeeId?.toLowerCase().includes(value) ||
      appointment.doctorName?.toLowerCase().includes(value) ||
      appointment.doctorDepartment?.toLowerCase().includes(value) ||
      appointment.timeSlot?.toLowerCase().includes(value) ||
      appointment.status?.toLowerCase().includes(value) ||
      appointment.reason?.toLowerCase().includes(value)
    );

    this.expandedAppointment = null;
    this.cdr.markForCheck();
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredAppointments = [...this.appointments];
    this.expandedAppointment = null;
    this.cdr.markForCheck();
  }

  toggleRow(appointment: any): void {
    this.expandedAppointment =
      this.expandedAppointment === appointment ? null : appointment;

    this.cdr.markForCheck();
  }

  closeExpandedRow(): void {
    this.expandedAppointment = null;
    this.cdr.markForCheck();
  }

  getStatusCount(status: string): number {
    return this.appointments.filter(
      (appointment: any) => appointment.status === status
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
      disableClose: true,
    });

    ref.afterClosed().subscribe((result) => {
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

    if (!appointment?.appointmentId) {
      this.toastr.error('Appointment ID missing');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete appointment ${appointment.appointmentId}?`
    );

    if (!confirmed) {
      return;
    }

    this.appointmentService
      .deleteAppointment(appointment.appointmentId)
      .subscribe({
        next: () => {
          this.toastr.success('Appointment deleted successfully');
          this.expandedAppointment = null;
          this.loadAppointments();
        },
        error: (err) => {
          this.toastr.error(
            err?.error?.message || 'Delete failed'
          );
        },
      });
  }

  getPatientDisplayName(appointment: any): string {
    return appointment?.patientName || 'N/A';
  }

  getDoctorDisplayName(appointment: any): string {
    if (!appointment?.doctorName) {
      return 'N/A';
    }

    return appointment.doctorName.startsWith('Dr.')
      ? appointment.doctorName
      : `Dr. ${appointment.doctorName}`;
  }
}