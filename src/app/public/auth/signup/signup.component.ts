import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService } from '../../../core/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  submitted = false;
  passwordVisible = false;
  loading = false;
  error = '';
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserProfileService
  ) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  // Check if field is touched or form is submitted
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  // Check if field is valid and touched
  isFieldValid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.signupForm.invalid) {
      // Mark all fields as touched to show validation
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';

    // Create payload from form values
    const payload: any = {
      fullname: this.f.fullname.value,
      email: this.f.email.value,
      password: this.f.password.value
    };

    this.userService.register(payload).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('Signup response:', response);
        response = response?.body ?? response;
        const responseCode = String(response?.responseCode ?? "");
        const responseMessage =
          response?.responseMessage ??
          response?.message ??
          "Đăng ký thành công";

        // Treat any 2xx code or explicit successful body as success
        if (responseCode.startsWith("2") || response?.body === true) {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: responseMessage,
            confirmButtonText: 'Đăng nhập ngay'
          }).then(() => {
            this.router.navigate(["/public/login"]);
          });
        } else {
          this.error = responseMessage || "Đăng ký thất bại. Vui lòng thử lại.";
          Swal.fire({
            icon: 'error',
            title: 'Đăng ký thất bại',
            text: this.error
          });
        }
      },
      (error: any) => {
        this.loading = false;
        const msg =
          error?.error?.responseMessage ||
          error?.error?.message ||
          "Đăng ký thất bại. Vui lòng thử lại sau.";
        this.error = msg;
        Swal.fire({
          icon: 'error',
          title: 'Đăng ký thất bại',
          text: this.error
        });
      }
    );
  }

  signupWithGoogle(): void {
    // TODO: Implement Google signup
    console.log('Signup with Google');
  }

  signupWithFacebook(): void {
    // TODO: Implement Facebook signup
    console.log('Signup with Facebook');
  }

  goToLogin(): void {
    this.router.navigate(['/public/login']);
  }
}
