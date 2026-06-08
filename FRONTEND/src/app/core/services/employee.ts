import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface EmployeeRegistrationRequest {
  name: string;
  phone: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  medicalRegistrationNo?: string;
  specialization?: string;
  qualification?: string[];
  consultationFee?: number;
  availabilitySlots?: string[];
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);

  registerEmployee(payload: EmployeeRegistrationRequest) {
    return this.http.post(`${environment.apiUrl}/api/employees/register`, payload);
  }
}
