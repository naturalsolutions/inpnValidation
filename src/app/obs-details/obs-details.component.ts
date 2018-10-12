import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObservationService } from '../services/observation.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import * as _ from "lodash";

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
  private icons = {
    506: "icon-reptile_amphibien",
    501: "icon-champignon_lichen",
    502: "icon-crabe_crevette_cloporte_millepatte",
    503: "icon-escargot_mollusque",
    504: "icon-insecte_araignee",
    154: "icon-mammifere",
    148: "icon-oiseau",
    505: "icon-plante_mousse_fougere",
    158: "icon-poisson",
    24222202: "icon-more",
  };
  obsLoaded: boolean = false;
  observation: any;
  photoSelected: any;
  modalRef: NgbModalRef;
  validationHistory: any[];
  nextStep: boolean =true;
  observationScore: any[];
  constructor(private route: ActivatedRoute,
    private observationService: ObservationService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.observationService.getObsByID(this.id).subscribe((obs) => this.observation = obs,
      (err) => console.log("err", err),
      () => {
        console.log('id', this.id);
        console.log("obsDetails", this.observation);
        this.photoSelected = this.observation.photos[0].inpnFileUri;
        this.getValidationHistory(this.id)
      }
    )

  }
  selectPhoto(photo) {
    console.log('photo', photo);
    this.photoSelected = photo.inpnFileUri

  }
  agrandirPhoto(largePhoto) {
    this.modalRef = this.modalService.open(largePhoto, { centered: true, windowClass: 'css-modal' })
  }


  getValidationHistory(dataId){
    this.observationService.getValidationHistory(dataId)
    .subscribe(
      (validationHistory)=> this.validationHistory=validationHistory,
      (error) => console.log("getValidationHistoryErr", error),
      () =>{
        this.validationHistory=_.sortBy(this.validationHistory, ['idStatus','dateStatus']);
        if(_.findKey(this.validationHistory, ['idStatus', 5]))
        this.nextStep=false;
        console.log('this.validationHistory',this.validationHistory);
        this.getObservationScore(this.id)
        
      }      
    )
  }
  getObservationScore(dataId){
    this.observationService.getObservationScore(dataId)
    .subscribe(
      (observationScore)=> this.observationScore=observationScore,
      (error) => console.log("getObservationScoreErr", error),
      () =>{
        console.log('this.observationScore',this.observationScore);
        this.obsLoaded = true;
        setTimeout(() => {
          if (this.mymap != undefined || this.mymap != null) {
            this.mymap.remove();
          }
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
