import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { User } from "../user";
import * as _ from "lodash";
@Component({
  selector: 'app-validation-page',
  templateUrl: './validation-page.component.html',
  styleUrls: ['./validation-page.component.scss']
})
export class ValidationPageComponent implements OnInit {

  currentUser: User;
  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginService.getUser().subscribe(
      (user) => {
        this.currentUser = user;
        console.log("this.currentUser", this.currentUser);
      },
      (error) => console.log("getUserERR", error),
      () => {
        
        let roles = this.currentUser.attributes.GROUPS.split(",");
        console.log("roles", roles);
        console.log("role22", _.includes(roles, 'INPN_USER'));

        if (_.includes(roles, 'IE_VALIDATOR_PHOTO') || _.includes(roles, 'IE_VALIDATOR_GRSIMPLE') ||
            _.includes(roles, 'IE_VALIDATOR_GROPE') || _.includes(roles, 'IE_VALIDATOR_EXPERT'))
        this.loginService.setIsConnected(true);

      }
    )
  }



}
