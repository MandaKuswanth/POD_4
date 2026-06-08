import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);

  readonly registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      role: ['RECEPTIONIST', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      medicalRegistrationNo: [''],
      specialization: [''],
      qualification: [''],
      consultationFee: [''],
      availabilitySlots: ['']
    },
    {
      validators: this.passwordsMatchValidator()
    }
  );

  isSubmitting = false;
  statusMessage = '';

  constructor() {
    this.updateRoleSpecificValidators();
    this.registerForm.get('role')?.valueChanges.subscribe(() => {
      this.updateRoleSpecificValidators();
    });
  }

  get isDoctor(): boolean {
    return this.registerForm.get('role')?.value === 'DOCTOR';
  }

  get needsQualification(): boolean {
    return ['DOCTOR', 'NURSE'].includes(this.registerForm.get('role')?.value || '');
  }

  fieldHasError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  fieldErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    }
    if (control.errors['pattern']) {
      return 'Please enter a valid 10-digit phone number.';
    }
    if (control.errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    return 'Please enter a valid value.';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.statusMessage = 'Please correct the highlighted fields before submitting.';
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = 'Submitting your registration request...';

    const payload = this.buildPayload();

    this.employeeService.registerEmployee(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.statusMessage = response?.message || 'Registration submitted successfully. Please wait for admin approval.';
        this.registerForm.reset({
          name: '',
          email: '',
          phone: '',
          department: '',
          designation: '',
          role: 'RECEPTIONIST',
          password: '',
          confirmPassword: '',
          medicalRegistrationNo: '',
          specialization: '',
          qualification: '',
          consultationFee: '',
          availabilitySlots: ''
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.statusMessage = error?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  private updateRoleSpecificValidators(): void {
    const role = this.registerForm.get('role')?.value || '';

    const medicalRegistrationNo = this.registerForm.get('medicalRegistrationNo');
    const specialization = this.registerForm.get('specialization');
    const qualification = this.registerForm.get('qualification');
    const consultationFee = this.registerForm.get('consultationFee');
    const availabilitySlots = this.registerForm.get('availabilitySlots');

    [medicalRegistrationNo, specialization, qualification, consultationFee, availabilitySlots].forEach((control) => {
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    if (role === 'DOCTOR') {
      medicalRegistrationNo?.setValidators([Validators.required, Validators.minLength(4)]);
      specialization?.setValidators([Validators.required, Validators.minLength(2)]);
      qualification?.setValidators([Validators.required]);
      consultationFee?.setValidators([Validators.required, Validators.min(1)]);
      availabilitySlots?.setValidators([Validators.required]);
    } else if (role === 'NURSE') {
      qualification?.setValidators([Validators.required]);
    }

    [medicalRegistrationNo, specialization, qualification, consultationFee, availabilitySlots].forEach((control) => {
      control?.updateValueAndValidity();
    });
  }

  private buildPayload() {
    const raw = this.registerForm.getRawValue();

    return {
      ...raw,
      qualification: this.parseList(raw.qualification),
      availabilitySlots: this.parseList(raw.availabilitySlots),
      consultationFee: raw.consultationFee ? Number(raw.consultationFee) : undefined
    };
  }

  private parseList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private passwordsMatchValidator() {
    return (form: any) => {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;

      return password && confirmPassword && password !== confirmPassword
        ? { passwordMismatch: true }
        : null;
    };
  }
}
