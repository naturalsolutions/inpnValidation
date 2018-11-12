import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ObservationService } from '../services/observation.service';
import { icons } from "../shared/icons";
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  private homeStyle = "homeStyle";
  userConnected: boolean = false;
  loadPage: boolean = false;
  obsLoaded: boolean = false;
  observations: any;
  totalItems: number;
  users: any;
  nbObservateurs: any;

  constructor(
    private userService: UserService,
    private observationService: ObservationService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.userService.getIsConnected().subscribe(
      (isConnected) => {
        this.userConnected = isConnected;
      })
    this.getObs();
  }

  usersRank() {
    this.userService.getUsersRank()
      .subscribe(
        (users) => {
          this.nbObservateurs = new Intl.NumberFormat().format(users.totLines);
          this.users = _.take(users.Scores, 5);
          _.map(this.users, (value) => {
            value.score = new Intl.NumberFormat().format(value.score)
          })
          this.obsLoaded = true;
          this.spinner.hide();
        }
      )
  }

  getObs() {
    this.obsLoaded = false;
    this.spinner.show();
    let obsFilter = {
      "filtreStatutValidation": "5"
    }
    this.observationService.getObservations({
      paginStart: 1,
      paginEnd: 4,
    }, obsFilter)
      .subscribe(
        (obs) => {
          this.observations = obs;
          this.totalItems = obs.totLines;
        },
        (error) => console.log("getObservationsErr", error),
        () => {
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
          this.usersRank()
        }
      )
  }

}
