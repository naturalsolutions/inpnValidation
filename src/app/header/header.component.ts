import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { User } from "../user";
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import 'rxjs/add/operator/first';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userConnected: boolean = false;
  private currentUser: User;
  public isCollapsed = true;
  loadHeader: boolean = false;
  public role;
  public obsRoute;
  aa;
  constructor(
    private loginService: LoginService,
    private spinner: NgxSpinnerService,
    protected router: Router,
  ) { }

  ngOnInit() {
   
    this.isConnected();

  }


  isConnected() {
    console.log("Headers");
    
    this.loginService.getIsConnected()
      .subscribe(
        (isConnected) => {
          console.log("isConnected",isConnected);
          if(isConnected==true)
          this.loginService.getUser().subscribe(
            (currentUser) => this.currentUser = currentUser,
            (error) => console.log("getUserErr: ", error),
            () => {
              this.loadHeader = true;
              console.log("userStatus", isConnected);
              this.userConnected = isConnected;
              this.role = this.currentUser.attributes.GROUPS;
              console.log("this.role", this.role);
              if (this.role == "IE_VALIDATOR_PHOTO")
                this.obsRoute = "gallery";
              else
                this.obsRoute = "observations";
            }
          )
          else
          {
            this.loadHeader = true;
            this.userConnected = isConnected;
          }

        })
  }




  isconnected() {
    this.loginService.isconnected()
      .then(
        (status) => {
          console.log("status", status);

          this.userConnected = status;
          this.loadHeader = true;
          this.currentUser = this.loginService.userProfile;
          if (this.userConnected) {
            this.role = this.currentUser.attributes.GROUPS;
            console.log("this.role", this.role);
            if (this.role == "IE_VALIDATOR_PHOTO")
              this.obsRoute = "gallery";
            else
              this.obsRoute = "observations";
          }


        }
      )

  }
  logout() {
    this.loginService.logout();
    this.router.navigate(['home']);
  }


}
