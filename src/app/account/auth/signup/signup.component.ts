import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '../../../core/services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  submitted = false;
  error = '';
  successmsg = false;
  authorities:any;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router,
    private userService: UserProfileService) { }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      identifier: ['', Validators.required],
      fullname: ['', Validators.required],
      address: ['', Validators.required],
      repreFullName: [''],
      company: [''],
      companyAddress: [''],
      phone: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    } else {
      // if (environment.defaultauth === 'firebase') {
      //   this.authenticationService.register(this.f.email.value, this.f.password.value).then((res: any) => {
      //     this.successmsg = true;
      //     if (this.successmsg) {
      //       this.router.navigate(['/dashboard']);
      //     }
      //   })
      //     .catch(error => {
      //       this.error = error ? error : '';
      //     });
      // } else {
        // this.userService.register(this.signupForm.value)
        //   .pipe(first())
        //   .subscribe(
        //     res => {
        //       alert(res.body);
        //       if (this.successmsg) {
        //         alert("Đăng ký tài khoản thành công, Vui lòng chờ phê duyệt trong thời gian sớm nhất, Liên hệ 0978145314");
        //         this.router.navigate(['/account/login']);
        //       }
        //     },
        //     error => {
        //       this.error = error ? error : '';
        //     });
        this.userService.register(this.signupForm.value).subscribe(res => {

          this.authorities = res.body;
          if(this.authorities?.body){
            alert("Đăng ký tài khoản thành công, Vui lòng chờ phê duyệt trong thời gian sớm nhất, Liên hệ 0978145314");
            this.router.navigate(['/account/login']);
          }else{
            alert("Đăng ký tài không khoản thành công, Vui lòng thử lại sau");
          }
        })
      }
  }
}
