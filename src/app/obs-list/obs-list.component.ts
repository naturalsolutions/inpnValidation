import { Component, OnInit, Input } from '@angular/core';
import { ObservationService } from '../services/observation.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash";


@Component({
  selector: 'app-obs-list',
  templateUrl: './obs-list.component.html',
  styleUrls: ['./obs-list.component.scss']
})
export class ObsListComponent implements OnInit {

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

  public obsLoaded: boolean = false;
  noObs: boolean = false;
  selectedObs: any;
  private observations;
  totalItems;
  private cuurentPage: number = 1;
  private nbItems: number = 11;
  private previousPage: number = 1;
  principalPhoto: any;
  groupeOP: any;
  groupeSimple: any;
  listGroupeSimple;
  listGroupeSimpleArray: any; 
  expertValidator: boolean = false;
  gropValidator: boolean = false;


  
  constructor(
    private spinner: NgxSpinnerService,
    private observationService: ObservationService
  ) { }

  ngOnInit() {
    this.getObs(this.cuurentPage, this.nbItems + 1);
  }

  loadPage(page: number) {
    let paginStart;
    let paginEnd;
    if (page !== this.previousPage) {
      if (page > 1)
        paginStart = this.nbItems * (page - 1);
      else
        paginStart = 1;
      this.previousPage = page;
      paginEnd = paginStart + this.nbItems
      this.getObs(paginStart, paginEnd)
    }
  }

  getObs(paginStart, paginEnd) {
    this.spinner.show();
    this.obsLoaded = false;
   
    this.observationService.getObservations({
      paginStart: paginStart,
      paginEnd: paginEnd
    }, {
        "filtreStatutValidation": "5",
        "filtreAllPhotoTreated": "true",
        "filtrePhotoValidated": "true"
      })
      .subscribe(
        (obs) => {
          console.log("obs :", obs);
          if (!obs)
            console.log("no obs");
          else {
            this.observations = obs;
            this.totalItems = obs.totLines;
          }
        },
        (error) => console.log("getObservationsErr", error),
        () => {
          if (this.observations)
          {  
            _.map(this.observations.observations, (value) => {
              value.truePhoto=[]
              _.map(value.photos, (photo) => {
                if (photo.isValidated == "true")
                  value.truePhoto.push(photo)           
                return photo
              });
              value.principalPhoto = _.find(value.photos, { "cdPhoto": value.cdPhotoPrincipal });
              value.icon = this.icons[value.groupSimple];
              return value
            });
            console.log("this.observations",this.observations);
            
            this.obsLoaded = true;
            this.spinner.hide()}
          else {
            this.noObs = true;
            this.spinner.hide()
          }
        }
      )
  }
}
