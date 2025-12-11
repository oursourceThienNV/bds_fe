import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../../account/auth/login/login.service';
import { AccountService } from '../../../account/auth/account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  passwordVisible = false;
  loading = false;
  error = '';
  returnUrl: string;
  year: number = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.loginService.login({
      username: this.f.email.value,
      password: this.f.password.value
    }).subscribe(
      () => {
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error => {
        this.loading = false;
        this.error = 'Tài khoản và mật khẩu không đúng, vui lòng thử lại sau';
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: this.error
        });
      }
    );
  }

  loginWithGoogle(): void {
    // TODO: Implement Google login
    console.log('Login with Google');
  }

  loginWithLinkedIn(): void {
    // TODO: Implement LinkedIn login
    console.log('Login with LinkedIn');
  }

  goToSignup(): void {
    this.router.navigate(['/public/signup']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/account/reset-password']);
  }
}
