import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { User } from "../user";
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
@Component({
  selector: 'app-validation-page',
  templateUrl: './validation-page.component.html',
  styleUrls: ['./validation-page.component.scss']
})
export class ValidationPageComponent implements OnInit {
  grpTaxoValidator: boolean = false;
  especeValidator: boolean = false;
  grpSimpleValidator: boolean = false;
  photoValidator: boolean = false;
  currentUser: User;
  user;
  roles;
  userRole;
  isValidator: boolean = false;
  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginService.getUser().subscribe(
      (user) => {
        this.currentUser = user;
      },
      (error) => console.log("getUserERR", error),
      () => {
        this.loginService.setIsConnected(true);
        this.roles = this.currentUser.attributes.GROUPS.split(",");
        if (_.includes(this.roles, 'IE_VALIDATOR_PHOTO'))
          this.photoValidator = true
        if (_.includes(this.roles, 'IE_VALIDATOR_GRSIMPLE'))
          this.grpSimpleValidator = true
        if (_.includes(this.roles, 'IE_VALIDATOR_GROPE'))
          this.grpTaxoValidator = true
        if (_.includes(this.roles, 'IE_VALIDATOR_EXPERT'))
          this.especeValidator = true
        if (_.includes(this.roles, 'IE_VALIDATOR_PHOTO') || _.includes(this.roles, 'IE_VALIDATOR_GRSIMPLE') ||
          _.includes(this.roles, 'IE_VALIDATOR_GROPE') || _.includes(this.roles, 'IE_VALIDATOR_EXPERT'))
          this.isValidator = true;

      }
    )
  }



}
