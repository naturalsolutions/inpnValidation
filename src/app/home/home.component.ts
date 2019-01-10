import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ObservationService } from '../services/observation.service';
import { icons } from "../shared/icons";
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash";
import { TextService } from '../services/text.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  title: any;
  textHomePage;
  textUplaod;
  loadPage: boolean = false;
  obsLoaded: boolean = false;
  observations: any;
  totalItems: number;
  users: any;
  fold1Image: any;
  fold2Image: any;
  textLoaded: boolean;
  keyNumber: Object;
  nbData: string;
  nbExperts: string;
  nbUsers: string;

  constructor(
    private userService: UserService,
    private observationService: ObservationService,
    private textService: TextService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.getObs();
  }

  usersRank() {
    this.userService.getUsersRank()
      .subscribe(
        (users) => {
          this.users = _.take(users.Scores, 5);
          _.map(this.users, (value) => {
            value.score = new Intl.NumberFormat().format(value.score)
          })
          this.textService.getKeynumbers().subscribe(
            (keyNumber) => {
              console.log("keyNumber", keyNumber);

              this.nbData = new Intl.NumberFormat().format(keyNumber.NbData);
              this.nbUsers = new Intl.NumberFormat().format(keyNumber.NbUsers);
              this.nbExperts = new Intl.NumberFormat().format(keyNumber.NbExperts)
              this.obsLoaded = true;
              this.spinner.hide();
            }
          )
        }
      )
  }

  getObs() {
    this.obsLoaded = false;
    this.textLoaded = false;
    this.spinner.show();
    this.getTexts();
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

  getTexts() {
    this.textService.getText('allText').subscribe(
      (res) => {
        this.title = this.strip_html_tags(_.find(res.textes, { "IdText": 24 }).Text);
        this.textHomePage = _.find(res.textes, { "IdText": 25 }).Text;
        this.textUplaod = _.find(res.textes, { "IdText": 26 }).Text;
        this.fold1Image = this.strip_html_tags(_.find(res.textes, { "IdText": 27 }).Text);
        this.fold2Image = this.strip_html_tags(_.find(res.textes, { "IdText": 28 }).Text);
        this.textLoaded = true;
      }
    )
  }


  strip_html_tags(str) {
    if ((str == null) || (str == ''))
      return false;
    else
      str = str.toString();
    return str.replace(/<[^>]*>/g, '');
  }



}
