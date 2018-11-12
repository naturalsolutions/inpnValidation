import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObservationService } from '../services/observation.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { icons } from "../shared/icons";
import * as L from 'leaflet';
import 'leaflet.markercluster';
import * as _ from "lodash";
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-obs-details',
  templateUrl: './obs-details.component.html',
  styleUrls: ['./obs-details.component.scss']
})

export class ObsDetailsComponent implements OnInit {
  id;
  mymap;
  mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
  mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>';

  obsLoaded: boolean = false;
  observation: any;
  photoSelected: any;
  modalRef: NgbModalRef;
  validationHistory: any[];
  nextStep: boolean = true;
  observationScore: any[];
  userProfile: any;
  userloaded: boolean = false;
  constructor(private route: ActivatedRoute,
    private userService: UserService,
    private observationService: ObservationService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.spinner.show();
    this.observationService.getObsByID(this.id).subscribe((obs) => this.observation = obs,
      (err) => console.log("err", err),
      () => {
        this.observation.icon = icons[this.observation.groupSimple];
        this.photoSelected = this.observation.photos[0];
        this.userService.getProfil(this.observation.idUtilisateur)
          .subscribe(
            (userProfil) => {
              this.userProfile = userProfil;
              this.userProfile.ScoreTotal = new Intl.NumberFormat().format(this.userProfile.ScoreTotal)
              this.userloaded = true;
              this.getValidationHistory(this.id)
            }
          )

      }
    )

  }

  selectPhoto(photo) {
    this.photoSelected = photo;
  }

  agrandirPhoto(largePhoto) {
    this.modalRef = this.modalService.open(largePhoto, { centered: true, windowClass: 'css-modal' })
  }

  getValidationHistory(dataId) {
    this.observationService.getValidationHistory(dataId)
      .subscribe(
        (validationHistory) => this.validationHistory = validationHistory,
        (error) => console.log("getValidationHistoryErr", error),
        () => {
          this.validationHistory = _.sortBy(this.validationHistory, ['idStatus', 'dateStatus']);
          if (_.findKey(this.validationHistory, ['idStatus', 5]))
            this.nextStep = false;
          this.getObservationScore(this.id)

        }
      )
  }

  getObservationScore(dataId) {
    this.observationService.getObservationScore(dataId)
      .subscribe(
        (observationScore) => this.observationScore = observationScore,
        (error) => console.log("getObservationScoreErr", error),
        () => {
          this.obsLoaded = true;
          this.spinner.hide();
          setTimeout(() => {
            this.mymap = L.map('mapid').setView([this.observation.Y, this.observation.X], 12);
            L.tileLayer(this.mbUrl, {
              attribution: this.mbAttr,
              maxZoom: 18,
              id: 'mapbox.streets',
              accessToken: 'pk.eyJ1IjoiYW1pbmVoYW1vdWRhIiwiYSI6ImNqM3dwYmdqdTAwMG8zMnBrNms0NG1pNDYifQ.odRR1wKtv3NpwNy3fsp5yw'
            }).addTo(this.mymap);
            L.marker([this.observation.Y, this.observation.X]).addTo(this.mymap);
          }, 100);
        }
      )
  }


}
