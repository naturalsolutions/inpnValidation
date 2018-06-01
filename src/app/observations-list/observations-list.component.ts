import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../services/observation.service';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';
import * as _ from "lodash";
import { ObsGuard } from '../services/obs-guard.service';
import { User } from "../user";
@Component({
  selector: 'app-observations-list',
  templateUrl: './observations-list.component.html',
  styleUrls: ['./observations-list.component.scss']
})
export class ObservationsListComponent implements OnInit {

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
  userRole: string;
  public obsLoaded: boolean = false;
  loadForm: boolean = false;
  valdidate;
  selectedObs: any;
  private observations;
  totalItems;
  private cuurentPage: number = 1;
  private nbItems: number = 11;
  private previousPage: number = 1;
  private listGroupOP;
  principalPhoto: any;
  groupeOP: any;
  groupeSimple: any;
  listGroupeSimple;
  listGroupeSimpleArray: any;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);
  searching: boolean = false;
  searchFailed: boolean = false;
  expertValidator: boolean = false;
  gropValidator: boolean = false;


  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private authGuard: ObsGuard,
    private observationService: ObservationService) { }

  ngOnInit() {
    this.currentUser = this.authGuard.userProfile;
    this.userRole = this.currentUser.attributes.GROUPS

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
    let filtreStatutValidation
    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        filtreStatutValidation = 2;
        break;
      case 'IE_VALIDATOR_GROPE':
        filtreStatutValidation = 3;
        this.gropValidator = true;
        break;
      case 'IE_VALIDATOR_EXPERT':
        filtreStatutValidation = 4;
        this.expertValidator = true
        break;
      default:
        break;
    }
    this.observationService.getObservations({
      paginStart: paginStart,
      paginEnd: paginEnd
    }, {
        "filtreStatutValidation": filtreStatutValidation,
        "filtreAllPhotoTreated": "true",
        "filtrePhotoValidated": "true"
      })
      .subscribe(
        (obs) => {
          console.log("obs :", obs);
          this.observations = obs;
          this.totalItems = obs.totLines;
        },
        (error) => console.log("getObservationsErr", error),
        () => {
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
                  switch (this.userRole) {
                    case 'IE_VALIDATOR_GRSIMPLE':
                      value.classValidBtn = {
                        'btn btn-success btn-valid': true,
                      }
                      value.classModifyBtn = {
                        'btn': true,
                        'btn-secondary': true,
                        ' btn-valid': true,
                        'btn-modify ': true,
                      }
                      break;
                    case 'IE_VALIDATOR_GROPE':
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
                      break;
                    case 'IE_VALIDATOR_EXPERT':
                      if (value.cdNom == 0 || value.cdGroupOP == 0)
                        value.canValidate = false
                      else
                        value.canValidate = true
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

                      break;
                    default:
                      break;
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

                      this.obsLoaded = true;
                      this.spinner.hide()
                      this.listGroupeSimpleArray = _.chunk(_.values(this.listGroupeSimple.GroupGp), 5);
                    }
                  )
              }
            )
        }
      )
  }

  open(content, obs) {
    this.selectedObs = obs;
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
              espece: [{
                nom_complet_valide: this.selectedObs.nomComplet,
                cd_ref: this.selectedObs.cdRef,
                cd_nom: [this.selectedObs.cdRefcdNom]
              }, Validators.required]
            });
          else
            this.validationForm = this.formBuilder.group({
              groupOP: ['', Validators.required],
              espece: ['', Validators.required]
            });

          this.validationForm.controls['groupOP'].statusChanges
            .subscribe((data) => {
              this.selectedObs.previousCdGroupOP = this.selectedObs.cdGroupOP;
              this.selectedObs.cdGroupOP = this.validationForm.controls['groupOP'].value
            })
          this.loadForm = true;
        }
      )
    this.modalRef = this.modalService.open(content, { centered: true, windowClass: 'css-modal' })
    this.modalRef.result.then((result) => {
    }, (reason) => {

      _.map(this.listGroupeSimple.GroupGp, (value) => {
        if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
          value.selectedObs = ""
        return value
      });
      if (this.selectedObs.gpSipmlePrevious) {
        this.selectedObs.gpSipmle = this.selectedObs.gpSipmlePrevious;
        this.selectedObs.groupSimple = this.selectedObs.groupSimplePrevious;
      }
      if (this.selectedObs.previousCdGroupOP != 'undefined') {
        this.selectedObs.cdGroupOP = this.selectedObs.previousCdGroupOP;
      }
    });
  }

  private validateObs(idData, groupSimple?, groupOP?, cdNom?, cdRef?) {
    let idValidateur = (this.currentUser.attributes.ID_UTILISATEUR).toString();
    let idStatus = '2';
    let isValidated = 'false';
    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        idStatus = '3'
        break;
      case 'IE_VALIDATOR_GROPE':
        idStatus = '4'
        break;
      case 'IE_VALIDATOR_EXPERT':
        idStatus = '5'
        isValidated = 'true'
        break;
      default:
        break;
    }

    this.observationService.validateObs(idData, idValidateur, isValidated,
      idStatus, groupSimple, groupOP, cdNom, cdRef).subscribe(
        (data) => {
          _.map(this.observations.observations, (value) => {
            if (value.idData == idData) {
              value.isTreated = true;
            }
            return value
          });
          this.modalRef.close()
        },
        (error) => console.log("error validateObs", error)
      )
  }

  private shortcutValidate(obs) {

    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        this.validateObs(obs.idData, obs.groupSimple)
        break;
      case 'IE_VALIDATOR_GROPE':
        if (obs.groupeOP) {
          console.log("obs.groupOP", obs.groupeOP.cdGroup);

          this.validateObs(obs.idData, obs.groupSimple, obs.groupOP)
        }
        else console.log("shortcut gop error");
        break;
      case 'IE_VALIDATOR_EXPERT':
        if (obs.groupOP && typeof obs.espece == "object") {
          this.validateObs(obs.idData, obs.groupSimple,
            obs.groupOP, obs.espece.cd_nom[0], obs.espece.cd_ref)
        }
        else {
          console.log("shortcut  error espece");
          this.validationForm.controls['espece'].setErrors({ "err": "error espece" })
        }
        break;
      default:
        break;
    }
  }

  submit(obsForm) {
    console.log("obsForm", obsForm);
    {
      switch (this.userRole) {
        case 'IE_VALIDATOR_GRSIMPLE':
          this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple)
          break;
        case 'IE_VALIDATOR_GROPE':
          if (obsForm.controls.groupOP.valid) {
            this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple, obsForm.value.groupOP)
            this.selectedObs.cdGroupOP = obsForm.value.groupOP;
            this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP) })
          }
          else console.log("form error");
          break;
        case 'IE_VALIDATOR_EXPERT':
          if (obsForm.valid) {
            if (typeof obsForm.value.espece == "object") {
              this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple,
                obsForm.value.groupOP, obsForm.value.espece.cd_nom[0], obsForm.value.espece.cd_ref)
              this.selectedObs.cdGroupOP = obsForm.value.groupOP;
              this.selectedObs.nomCompletHtml = obsForm.value.espece.nom_complet_html_valide;
              this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP) })
            }
            else {
              console.log("form error espece");
              this.validationForm.controls['espece'].setErrors({ "err": "error espece" })
            }
          }
          else console.log("form error");
          break;
        default:
          break;
      }
    }


  }

  modifyGrpSimple(grpSimple) {
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = ""
      return value
    });
    this.selectedObs.gpSipmlePrevious = this.selectedObs.gpSipmle;
    this.selectedObs.groupSimplePrevious = this.selectedObs.groupSimple;
    this.selectedObs.gpSipmle = grpSimple;
    this.selectedObs.groupSimple = grpSimple.cdGroupGrandPublic;

    this.observationService.getlistGroupOP(this.selectedObs.groupSimple)
      .subscribe(
        (groupOP) => this.listGroupOP = groupOP,
        (error) => console.log("getlistGroupOPErr", error),
        () => {
          this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": this.selectedObs.cdGroupOP });
        }
      )
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = "btn-selected"
      return value
    });

  }

  formatMatches = (value: any) => value.nom_complet_valide || '';
  search = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.observationService.getEspece(term, this.selectedObs.cdGroupOP)
          .do((espece) => {
            this.searchFailed = false
          })
          .catch(() => {
            this.searchFailed = true;
            return of([]);
          }))
      .do(() => this.searching = false)
      .merge(this.hideSearchingWhenUnsubscribed);
}
