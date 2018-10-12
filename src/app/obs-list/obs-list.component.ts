import { Component, OnInit, OnDestroy } from '@angular/core';
import { ObservationService } from '../services/observation.service';
import { FilterService } from '../services/filter.service'
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash";

@Component({
  selector: 'app-obs-list',
  templateUrl: './obs-list.component.html',
  styleUrls: ['./obs-list.component.scss']
})
export class ObsListComponent implements OnInit, OnDestroy {
  filter: any = {};
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
  private observations;
  invalidPhoto: boolean = false;
  totalItems;
  private cuurentPage: number = 1;
  private nbItems: number = 12;
  private previousPage: number = 1;
  principalPhoto: any;
  nbFilterSelected: any;
  userChecked: boolean = false;
  mySubscription;
  validator = {
    photoSelect: false,
    grpSimpleSelect: false,
    grpTaxoSelect: false,
    especeSelect: false,
    userId: null,
    userRole: null,
    isValidator: false,
    validationFilter: false
  }

  constructor(
    private spinner: NgxSpinnerService,
    private observationService: ObservationService,
    private filterService: FilterService,
  ) { }

  ngOnInit() {
    this.mySubscription = this.filterService.getFilter().subscribe(
      (filter) => {
        if (filter != 'init') {
          this.filter = filter;
          if (this.filter)
            this.reloadObs(this.filter)
          else {
            this.invalidPhoto = false;
            this.reloadObs()
          }
        }
      })
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
      if (this.filter)
        this.getObs(paginStart, paginEnd, this.filter)
      else
        this.getObs(paginStart, paginEnd)
    }
  }

  getObs(paginStart, paginEnd, filter?) {
    this.spinner.show();
    this.obsLoaded = false;
    let obsFilter = {
      "filtreStatutValidation": "5",
    }
    if (filter) {
      if (!filter.idUtilisateur)
        this.filter.filtreStatutValidation = '5';
      filter = _.omitBy(filter, _.isNil);
      console.log("filter", filter);

      this.nbFilterSelected = _.size(filter);
      console.log("this.nbFilterSelected", this.nbFilterSelected);
      if (!filter.idUtilisateur)
        this.nbFilterSelected--;
      if (filter.idUtilisateur == false)
        this.nbFilterSelected--;
      this.filterService.setFilterNotifications(this.nbFilterSelected)

      Object.keys(filter).forEach(function (key) {
        if (key == 'cdSig')
          filter[key] = filter[key].cd_sig_ref
        if (key == 'pseudo')
          filter[key] = filter[key].pseudo
        if (key == 'taxon')
          filter[key] = filter[key].cd_nom[0]
      });
      if (filter.idUtilisateur)
        this.invalidPhoto = true;
      else
        this.invalidPhoto = false;

      obsFilter = filter
    }
    else {
      this.filterService.setFilterNotifications(0)
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
              value.icon = this.icons[value.groupSimple];
              return value
            });
            console.log("this.observations", this.observations);
            this.obsLoaded = true;
            this.spinner.hide();
          }
          else {
            this.spinner.hide();
          }
        }
      )
  }
  private reloadObs(filter?) {
    this.cuurentPage = 1;
    this.getObs(this.cuurentPage, this.nbItems, filter);
  }
  getUser(currentUser) {
    this.userChecked = true;
    if (currentUser) {
      this.validator.userId = currentUser.attributes.ID_UTILISATEUR;
      this.filterService.setFilterNotifications(1);
      this.filter = { 'idUtilisateur': this.validator.userId };
      this.reloadObs(this.filter);
      let roles = currentUser.attributes.GROUPS.split(",");
      if (_.includes(roles, 'IE_VALIDATOR_PHOTO')) {
        this.validator.photoSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_PHOTO'
      }
      if (_.includes(roles, 'IE_VALIDATOR_GRSIMPLE')) {
        this.validator.grpSimpleSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_GRSIMPLE'
      }
      if (_.includes(roles, 'IE_VALIDATOR_GROPE')) {
        this.validator.grpTaxoSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_GROPE'
      }
      if (_.includes(roles, 'IE_VALIDATOR_EXPERT')) {
        this.validator.especeSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_EXPERT'
      }
      if (_.includes(roles, 'IE_VALIDATOR_PHOTO') || _.includes(roles, 'IE_VALIDATOR_GRSIMPLE') ||
        _.includes(roles, 'IE_VALIDATOR_GROPE') || _.includes(roles, 'IE_VALIDATOR_EXPERT'))
        this.validator.isValidator = true;
    }
    else
      this.reloadObs()
  }
  ngOnDestroy() {
    this.filterService.setFilter('init');
    if (this.mySubscription)
      this.mySubscription.unsubscribe();
  }

}

