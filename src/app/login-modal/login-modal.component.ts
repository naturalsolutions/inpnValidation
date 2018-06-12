import { Component, ViewEncapsulation, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login-modal',
  templateUrl: './login-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {

  @Input() btnClass;
  user;
  loginForm: FormGroup;
  private modalRef: NgbModalRef;
  errorMsg: string = "Email ou mot de passe incorrect";
  errorLogin: boolean = false;
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    protected router: Router,
    private loginService: LoginService) {
  }

  ngOnInit() {

  }

  public open(content) {
    this.errorLogin = false;
    this.modalRef = this.modalService.open(content, { centered: true });
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.email],
      password: ['', Validators.required],
    })
  }

  public login(loginForm) {
    this.user = loginForm.value;
    this.loginService.login(this.user.username, this.user.password)
      .subscribe(
        (res) => {
          let token = this.splitString(res);
          localStorage.setItem('inpnUser_Access_token', token.access_token);
          localStorage.setItem('inpnUser_refresh_token', token.refresh_token);
        },
        error => {
          if (error.statusText == "Authorization Required")
            this.errorLogin = true
        },
        () => {
          this.loginService.setIsConnected(true);
          this.modalRef.close();
          this.router.navigate(['observations'])
        }
      );
  }

  private splitString(str) {
    return str.trim().split("&").reduce(function (a, b) {
      var i = b.split("=");
      a[i[0]] = i[1];
      return a;
    }, {})
  }

}
