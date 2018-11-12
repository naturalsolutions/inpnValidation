import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from "../shared/user";
import { icons } from "../shared/icons";
import { NgxSpinnerService } from 'ngx-spinner';
import { ObservationService } from '../services/observation.service';
import * as _ from "lodash";

@Component({
  selector: 'app-user-profil',
  templateUrl: './user-profil.component.html',
  styleUrls: ['./user-profil.component.scss']
})

export class UserProfilComponent implements OnInit {

  userProfile: any;
  userloaded: boolean = false;
  public obsLoaded: boolean = false;
  noObs: boolean = false;
  private observations;
  invalidPhoto: boolean = false;
  totalItems;
  private cuurentPage: number = 1;
  private nbItems: number = 16;
  private previousPage: number = 1;
  principalPhoto: any;
  nbFilterSelected: any;
  userChecked: boolean = false;
  userId: any;
  currentUserID: any;
  ownerProfil: boolean = false;

  constructor(
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private observationService: ObservationService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.userId = this.route.snapshot.params['id'];

  }


  loadPage(page: number) {
    let paginStart;
    let paginEnd;
    if (page !== this.previousPage) {
      if (page > 1)
        paginStart = this.nbItems * (page - 1) + 1;
      else
        paginStart = 1;
      this.previousPage = page;
      paginEnd = paginStart + this.nbItems - 1;
      this.getObs(paginStart, paginEnd)
    }
  }

  getObs(paginStart, paginEnd) {
    this.obsLoaded = false;
    let obsFilter
    if (this.ownerProfil)
      obsFilter = {
        "idUtilisateur": this.userId,
      }
    else
      obsFilter = {
        "idUtilisateur": this.userId,
        "filtreStatutValidation": "5",
      }
    this.observationService.getObservations({
      paginStart: paginStart,
      paginEnd: paginEnd,
    }, obsFilter)
      .subscribe(
        (obs) => {
          if (!obs) {
            console.log("no obs");
            this.noObs = true;
          }
          else {
            this.noObs = false;
            this.observations = obs;
            this.totalItems = obs.totLines;
          }
        },
        (error) => console.log("getObservationsErr", error),
        () => {
          if (this.observations) {
            _.map(this.observations.observations, (value) => {
              value.truePhoto = []
              _.map(value.photos, (photo) => {
                if (photo.isValidated == "true")
                  value.truePhoto.push(photo)
                return photo
              });
              value.principalPhoto = _.find(value.photos, { "cdPhoto": value.cdPhotoPrincipal });
              value.icon = icons[value.groupSimple];
              return value
            });
            this.obsLoaded = true;
            this.spinner.hide();
          }
          else {
            this.spinner.hide();
          }
        }
      )
  }
  private reloadObs() {
    this.cuurentPage = 1;
    this.getObs(this.cuurentPage, this.nbItems);
  }

  getCurrentUser(user) {
    this.userChecked = true;
    if (user) {
      this.currentUserID = user.attributes.ID_UTILISATEUR;
      if (this.userId == this.currentUserID)
        this.ownerProfil = true;
    };
    this.userService.getProfil(this.userId)
      .subscribe(
        (userProfil) => {
          this.userProfile = userProfil;
          this.userloaded = true;
          this.reloadObs()
        }
      )
  }
}
