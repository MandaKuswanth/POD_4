import { Routes } from '@angular/router';

import { Landing } from './features/landing/landing';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { AccountInactive } from './features/auth/account-inactive/account-inactive';
import { Dashboard } from './features/dashboard/dashboard';

import { EmployeeList } from './features/employee/employee-list/employee-list';
import { PatientList } from './features/patient/patient-list/patient-list';
import { AppointmentList } from './features/appointments/appointment-list/appointment-list';
import { Profile } from './features/profile/profile';

import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: Landing
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'reset-password',
        component: ResetPassword,
        canActivate: [authGuard]
    },
    {
        path: 'account-inactive',
        component: AccountInactive
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
    },
    {
        path: 'employees',
        component: EmployeeList,
        canActivate: [authGuard]
    },
    {
        path: 'patients',
        component: PatientList,
        canActivate: [authGuard]
    },
    {
        path: 'appointments',
        component: AppointmentList,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];