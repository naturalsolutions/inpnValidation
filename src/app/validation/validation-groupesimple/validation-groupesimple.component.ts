import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ObservationService } from '../../services/observation.service';
import { FilterService } from '../../services/filter.service'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormValidator } from '../especeValidator'
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Observable';

import * as _ from "lodash";
import * as moment from 'moment';
import { User } from "../../user";
import { TextService } from '../../services/text.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-validation-groupesimple',
  templateUrl: './validation-groupesimple.component.html',
  styleUrls: ['./validation-groupesimple.component.scss']
})
export class ValidationGroupesimpleComponent implements OnInit {


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
  private modalRef: NgbModalRef;
  validationForm: FormGroup;
  currentUser: User;
  @Output() hideFilterStatus = new EventEmitter();
  public obsLoaded: boolean = false;
  loadForm: boolean = false;
  noObs: boolean = false;
  especeUndefined: boolean = false;
  valdidate;
  selectedObs: any;
  private observations;
  totalItems;
  private cuurentPage: number = 1;
  private nbItems: number = 12;
  private previousPage: number = 1;
  private listGroupOP;
  principalPhoto: any;
  groupeOP: any;
  groupeSimple: any;
  listGroupeSimple;
  listGroupeSimpleArray: any;

  expertValidator: boolean = false;
  gropValidator: boolean = false;
  validation;
  helpText;
  filter: any = {};
  advencedSearch: boolean = false;
  disableButton: boolean = false;
  supraEspeceText: string = "+ Identifier au niveau supérieur ?";
  userChecked: boolean = false;
  validationText;
  validator = {
    photoSelect: false,
    grpSimpleSelect: false,
    grpTaxoSelect: false,
    especeSelect: false,
    userId: null,
    userRole: null,
    isValidator: false,
    validationFilter: true
  }
  mySubscription;
  nbFilterSelected: any;

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private textService: TextService,
    private filterService: FilterService,
    private observationService: ObservationService) { }

  ngOnInit() {
    this.mySubscription = this.filterService.getFilter().subscribe(
      (filter) => {
        if (filter != 'init') {
          this.filter = filter;
          if (this.filter)
            this.reloadObs(this.filter)
          else
            this.reloadObs()
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
      paginEnd = paginStart + this.nbItems - 1
      if (this.filter)
        this.getObs(paginStart, paginEnd, this.filter)
      else
        this.getObs(paginStart, paginEnd)
    }
  }
  private reloadObs(filter?) {
    this.getObs(this.cuurentPage, this.nbItems, filter);
  }

  getObs(paginStart, paginEnd, filter?) {

    if (filter) {
      filter = _.omitBy(filter, _.isNil);
      this.nbFilterSelected = _.size(filter);
      if (filter.filtreStatutValidation)
        this.nbFilterSelected--;
      if (filter.filtreAllPhotoTreated)
        this.nbFilterSelected--;
      if (filter.filtrePhotoValidated)
        this.nbFilterSelected--;
      this.filterService.setFilterNotifications(this.nbFilterSelected)
      Object.keys(filter).forEach(function (key) {
        if (key == 'cdSig')
          filter[key] = filter[key].cd_sig_ref
        if (key == 'pseudo')
          filter[key] = filter[key].pseudo
        if (key == 'taxon')
          filter[key] = filter[key].cd_nom[0]
      })
      this.filter = filter;
      this.filter.filtreStatutValidation = 2;
      this.filter.filtreAllPhotoTreated = "true";
      this.filter.filtrePhotoValidated = "true";
    }
    else {
      let intiFilter = {
        'filtreStatutValidation': 2,
        'filtreAllPhotoTreated': "true",
        'filtrePhotoValidated': "true",
      };
      this.filterService.setFilterNotifications(0);
      this.filter = intiFilter
    }
    this.spinner.show();
    this.obsLoaded = false;
    this.textService.getText(2).subscribe((text) => this.helpText = text);

    this.observationService.getObservations({
      paginStart: paginStart,
      paginEnd: paginEnd
    }, this.filter)
      .subscribe(
        (obs) => {
          console.log("obs :", obs);
          if (!obs) {
            this.observations = null;
            console.log("no obs")
          }
          else {
            this.observations = obs;
            this.totalItems = obs.totLines;
          }
        },
        (error) => console.log("getObservationsErr", error),
        () => {
          if (this.observations)
            this.observationService.getGroupeSimple()
              .subscribe(
                (data) => this.listGroupeSimple = data,
                (error) => console.log("getGroupeSimpleErr", error),
                () => {
                  _.map(this.listGroupeSimple.GroupGp, (value) => {
                    value.icons = this.icons[value.cdGroupGrandPublic];
                    value.selectedObs = ""
                    return value
                  });
                  _.map(this.observations.observations, (value) => {
                    value.dateCrea = moment(value.dateCrea).format('DD-MM-YYYY, h:mm');
                    value.classValidBtn = {
                      'btn btn-success btn-valid': true,
                    }
                    value.classModifyBtn = {
                      'btn': true,
                      'btn-secondary': true,
                      ' btn-valid': true,
                      'btn-modify ': true,
                    }
                    value.principalPhoto = _.find(value.photos, { "cdPhoto": value.cdPhotoPrincipal });
                    value.gpSipmle = _.find(this.listGroupeSimple.GroupGp, { "cdGroupGrandPublic": value.groupSimple })
                    return value
                  });
                  this.observationService.getlistGroupOP()
                    .subscribe(
                      (groupOP) => this.listGroupOP = groupOP,
                      (error) => console.log("getlistGroupOPErr", error),
                      () => {
                        _.map(this.observations.observations, (value) => {
                          value.groupeOP = _.find(this.listGroupOP, { "cdGroup": value.cdGroupOP });
                          return value
                        });
                        this.noObs = false;
                        this.listGroupeSimpleArray = _.chunk(_.values(this.listGroupeSimple.GroupGp), 5);
                        this.spinner.hide()
                        this.obsLoaded = true;
                      }
                    )
                }
              )
          else {
            this.noObs = true;
            this.spinner.hide()
          }
        }
      )
  }

  open(content, obs) {
    if (obs.nomComplet != "")
      this.especeUndefined = true;
    this.advencedSearch = false;
    this.selectedObs = obs;
    this.selectedObs.gpSipmlePrevious = [];
    this.selectedObs.groupSimplePrevious = [];
    this.selectedObs.previousCdGroupOP = [];
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = "btn-selected"
      return value
    });

    this.validationForm = this.formBuilder.group({
      comment: [''],
    });
    this.loadForm = true;

    this.modalRef = this.modalService.open(content, { centered: true, windowClass: 'validate-modal' })
    this.modalRef.result.then((result) => {
    }, (reason) => {
      this.closeModalConfig()
    });
  }

  private validateObs(idData, groupSimple?, groupOP?, cdNom?, cdRef?, comment?) {
    let idValidateur = (this.validator.userId).toString();
    let idStatus = '3';
    let isValidated = 'false';
    this.disableButton = true; 
    this.observationService.validateObs(idData, idValidateur, isValidated,
      idStatus, groupSimple, groupOP, cdNom, cdRef, comment).subscribe(
        (data) => {
          _.map(this.observations.observations, (value) => {
            if (value.idData == idData) {
              value.isTreated = true;
            }
            return value
          });
          if (this.modalRef) {
            this.closeModalConfig();
            this.modalRef.close()
          }
        },
        (error) => {
          console.log("error validateObs", error);
          this.disableButton = false
        },
        () => this.disableButton = false
      )
  }

  public shortcutValidate(obs) {
    this.validateObs(obs.idData, obs.groupSimple)
  }

  submit(obsForm) {
    this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple, null, null, null, obsForm.value.comment)
  }

  modifyGrpSimple(grpSimple) {
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = ""
      return value
    });
    this.selectedObs.gpSipmlePrevious.push(this.selectedObs.gpSipmle);
    this.selectedObs.groupSimplePrevious.push(this.selectedObs.groupSimple);
    this.selectedObs.gpSipmle = grpSimple;
    this.selectedObs.groupSimple = grpSimple.cdGroupGrandPublic;

    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = "btn-selected"
      return value
    });
  }

  openHelp(helpModal) {
    this.modalService.open(helpModal, { centered: true, windowClass: 'help-modal' })
  }
  openLargePhoto(largePhoto, obs) {
    this.selectedObs = obs;
    this.modalService.open(largePhoto, { centered: true, windowClass: 'css-modal' })
  }

  private closeModalConfig() {
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = ""
      return value
    });
    if (this.selectedObs.gpSipmlePrevious.length > 0) {
      this.selectedObs.gpSipmle = this.selectedObs.gpSipmlePrevious[0];
      this.selectedObs.groupSimple = this.selectedObs.groupSimplePrevious[0];
    }

  }

  getUser(currentUser) {
    this.userChecked = true;
    if (currentUser) {
      this.validator.userId = currentUser.attributes.ID_UTILISATEUR;
      let roles = currentUser.attributes.GROUPS.split(",");
      if (_.includes(roles, 'IE_VALIDATOR_PHOTO')) {
        this.validator.photoSelect = true;
      }
      if (_.includes(roles, 'IE_VALIDATOR_GRSIMPLE')) {
        this.validator.grpSimpleSelect = true;
      }
      if (_.includes(roles, 'IE_VALIDATOR_GROPE')) {
        this.validator.grpTaxoSelect = true;
      }
      if (_.includes(roles, 'IE_VALIDATOR_EXPERT')) {
        this.validator.especeSelect = true;
      }
      if (_.includes(roles, 'IE_VALIDATOR_PHOTO') || _.includes(roles, 'IE_VALIDATOR_GRSIMPLE') ||
        _.includes(roles, 'IE_VALIDATOR_GROPE') || _.includes(roles, 'IE_VALIDATOR_EXPERT'))
        this.validator.isValidator = true;
      this.reloadObs()
    }
  }

  ngOnDestroy() {
    this.filterService.setFilter('init');
    if (this.mySubscription)
      this.mySubscription.unsubscribe();
  }
}
