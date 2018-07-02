import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { User } from "../user";
import * as _ from "lodash";

@Component({
  selector: 'app-observation-page',
  templateUrl: './observation-page.component.html',
  styleUrls: ['./observation-page.component.scss']
})
export class ObservationPageComponent implements OnInit {

  selectedValidator: String = null;
  validationText: String = "Validation";
  currentUser: User;
  isActive: String = "grid";
  user;
  roles;
  userRole;
  showList :boolean = true;
  isValidator: boolean = false;
  photoSelect: boolean = false;
  grpSimpleSelect: boolean = false;
  especeSelect: boolean = false;
  grpTaxoSelect: boolean = false;
  constructor(private loginService: LoginService) {
  }

  ngOnInit() {
    this.loginService.getUser().subscribe(
      (user) => {
        console.log("user",user);
        
        this.currentUser = user;
      },
      (error) => console.log("getUserERR", error),
      () => {
        this.loginService.setIsConnected(true);
        this.roles = this.currentUser.attributes.GROUPS.split(",");
        if (_.includes(this.roles, 'IE_VALIDATOR_PHOTO'))
          this.photoSelect = true
        if (_.includes(this.roles, 'IE_VALIDATOR_GRSIMPLE'))
          this.grpSimpleSelect = true
        if (_.includes(this.roles, 'IE_VALIDATOR_GROPE'))
          this.grpTaxoSelect = true
        if (_.includes(this.roles, 'IE_VALIDATOR_EXPERT'))
          this.especeSelect = true
        if (_.includes(this.roles, 'IE_VALIDATOR_PHOTO') || _.includes(this.roles, 'IE_VALIDATOR_GRSIMPLE') ||
          _.includes(this.roles, 'IE_VALIDATOR_GROPE') || _.includes(this.roles, 'IE_VALIDATOR_EXPERT'))
          this.isValidator = true;
      }
    )
  }


  selectEspece() {
    this.selectedValidator = "espece";
    this.validationText = "Espèce";
    this.isActive="validation";
    this.showList=false
  }
  selectGrpTaxo() {
    this.selectedValidator = "taxo";
    this.validationText = "Groupe taxonomique";
    this.isActive="validation";
    this.showList=false
  }
  selectGrpSimple() {
    this.selectedValidator = "simple";
    this.validationText = "Groupe simple";
    this.isActive="validation";
    this.showList=false
  }
  selectPhoto() {
    this.selectedValidator = "photo";
    this.validationText = "Photos";
    this.isActive="validation",
    this.showList=false
  }
  gridObs(){
    this.isActive="grid";
    this.validationText = "Validation";
    this.selectedValidator = null;
    this.showList= true
  }
  mapObs(){
    this.isActive="maps";
    this.validationText = "Validation";
    this.selectedValidator = null;
    this.showList=false
  }
}
