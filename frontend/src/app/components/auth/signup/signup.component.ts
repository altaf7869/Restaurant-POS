import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [CommonModule,RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;

  roles: string[] = ['Admin', 'Cashier', 'Waiter']; // Role options

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', Validators.required],
      role: ['Waiter', Validators.required]  // default role
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submitForm() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.auth.signup(
      this.signupForm.value.username,
      this.signupForm.value.password,
      this.signupForm.value.fullName,
      this.signupForm.value.role
    ).subscribe({
      next: () => {
        this.successMessage = 'Signup successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Signup failed';
      }
    });
  }
}
