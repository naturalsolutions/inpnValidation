import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ObservationService } from '../../services/observation.service';
import { FilterService } from '../../services/filter.service'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash";
import * as moment from 'moment';
import { TextService } from '../../services/text.service';
import { icons } from "../../shared/icons";

@Component({
  selector: 'app-validation-groupetaxo',
  templateUrl: './validation-groupetaxo.component.html',
  styleUrls: ['./validation-groupetaxo.component.scss']
})
export class ValidationGroupetaxoComponent implements OnInit, OnDestroy {

  private modalRef: NgbModalRef;
  validationForm: FormGroup;
  public obsLoaded: boolean = false;
  loadForm: boolean = false;
  noObs: boolean = false;
  especeUndefined: boolean = false;
  selectedObs: any;
  private observations;
  totalItems;
  private cuurentPage: number = 1;
  private nbItems: number = 12;
  private previousPage: number = 1;
  private listGroupOP;
  principalPhoto: any;
  listGroupeSimple;
  listGroupeSimpleArray: any;
  gropValidator: boolean = false;
  helpText;
  filter: any = {};
  disableButton: boolean = false;
  userChecked: boolean = false;
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
      })
      this.filter = filter;
      this.filter.filtreStatutValidation = 3;
    }
    else {
      this.filterService.setFilterNotifications(0);
      let intiFilter = {
        'filtreStatutValidation': 3,
      };
      this.filter = intiFilter
    }
    this.spinner.show();
    this.obsLoaded = false;
    this.textService.getText(3).subscribe((text) => this.helpText = text);
    this.gropValidator = true;
    this.observationService.getObservations({
      paginStart: paginStart,
      paginEnd: paginEnd
    }, this.filter)
      .subscribe(
        (obs) => {
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
                    value.icons = icons[value.cdGroupGrandPublic];
                    value.selectedObs = ""
                    return value
                  });
                  _.map(this.observations.observations, (value) => {
                    value.dateCrea = moment(value.dateCrea).format('DD-MM-YYYY, h:mm');
                    if (value.cdGroupOP == 0)
                      value.canValidate = false;
                    else
                      value.canValidate = true;
                    value.classValidBtn = {
                      'btn btn-success btn-valid': value.canValidate,
                      'btn-valid-disabled': !value.canValidate
                    }
                    value.classModifyBtn = {
                      'btn': true,
                      'btn-secondary': true,
                      ' btn-valid': true,
                      'btn-modify ': value.canValidate,
                      'btn-modify-large': !value.canValidate
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
    this.selectedObs = obs;
    this.selectedObs.gpSipmlePrevious = [];
    this.selectedObs.groupSimplePrevious = [];
    this.selectedObs.previousCdGroupOP = [];
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = "btn-selected"
      return value
    });
    this.observationService.getlistGroupOP(this.selectedObs.groupSimple)
      .subscribe(
        (groupOP) => this.listGroupOP = groupOP,
        (error) => console.log("getlistGroupOPErr", error),
        () => {
          if (this.selectedObs.groupeOP)
            this.validationForm = this.formBuilder.group({
              groupOP: [this.selectedObs.groupeOP.cdGroup, Validators.required],
              comment: [this.selectedObs.validation.StatusComment],
            });
          else
            this.validationForm = this.formBuilder.group({
              groupOP: ['', Validators.required],
              comment: [this.selectedObs.validation.StatusComment]
            });


          this.validationForm.controls['groupOP'].statusChanges
            .subscribe((data) => {
              this.selectedObs.previousCdGroupOP.push(this.selectedObs.cdGroupOP);
              this.selectedObs.cdGroupOP = this.validationForm.controls['groupOP'].value
            })
          this.loadForm = true;
        }
      )
    this.modalRef = this.modalService.open(content, { centered: true, windowClass: 'validate-modal' })
    this.modalRef.result.then((result) => {
    }, (reason) => {
      this.closeModalConfig()
    });
  }

  private validateObs(idData, groupSimple?, groupOP?, cdNom?, cdRef?, comment?) {
    let idValidateur = (this.validator.userId).toString();
    let idStatus = '4';
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
    if (obs.groupeOP)
      this.validateObs(obs.idData, obs.groupSimple, obs.groupOP)
    else console.log("shortcut gop error");
  }

  submit(obsForm) {
    if (obsForm.controls.groupOP.valid) {
      this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple, obsForm.value.groupOP, null, null, obsForm.value.comment)
      this.selectedObs.cdGroupOP = obsForm.value.groupOP;
      this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP) })
    }
    else console.log("form error");
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

    this.observationService.getlistGroupOP(this.selectedObs.groupSimple)
      .subscribe(
        (groupOP) => this.listGroupOP = groupOP,
        (error) => console.log("getlistGroupOPErr", error),
        () => {
          this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": this.selectedObs.cdGroupOP });
          this.validationForm.controls['groupOP'].setValue("")
        }
      )
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
    if (this.selectedObs.previousCdGroupOP.length > 0) {
      this.selectedObs.cdGroupOP = this.selectedObs.previousCdGroupOP;
    }
  }


  getCurrentUser(currentUser) {
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
