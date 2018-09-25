import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ObservationService } from '../services/observation.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FormValidator } from './especeValidator'
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
import * as moment from 'moment';
import { ObsGuard } from '../services/obs-guard.service';
import { User } from "../user";
import { TextService } from '../services/text.service';
@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnChanges, OnInit {

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
  @Input() currentUser: User;
  @Input() userRole: string;
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
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);
  searching: boolean = false;
  searchFailed: boolean = false;
  expertValidator: boolean = false;
  gropValidator: boolean = false;
  helpText;
  @Input() filter;
  advencedSearch: boolean = false;
  disableButton: boolean = false;
  supraEspeceText: string = "+ trouver l'espèce par niveau supérieur ?";

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private authGuard: ObsGuard,
    private textService: TextService,
    private observationService: ObservationService) { }

  ngOnInit() {
    if (!this.filter)
      this.getObs(this.cuurentPage, this.nbItems);
  }

  ngOnChanges() {
    if (this.filter)
      this.reloadObs(this.filter)
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
  private reloadObs(filter) {
    this.getObs(this.cuurentPage, this.nbItems, filter);
  }
  getObs(paginStart, paginEnd, filter?) {
    let obsFilter = {
      "filtreStatutValidation": 0,
      "filtreAllPhotoTreated": "true",
      "filtrePhotoValidated": "true",
    }
    if (filter) {
      filter = _.omitBy(filter, _.isNil);
      Object.keys(filter).forEach(function (key) {
        if (key == 'cdSig')
          filter[key] = filter[key].cd_sig_ref
        if (key == 'pseudo')
          filter[key] = filter[key].pseudo
        obsFilter[key] = filter[key]
      });
    }
    this.spinner.show();
    this.obsLoaded = false;
    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        obsFilter.filtreStatutValidation = 2;
        this.textService.getText(2).subscribe((text) => this.helpText = text);
        break;
      case 'IE_VALIDATOR_GROPE':
        obsFilter.filtreStatutValidation = 3;
        this.textService.getText(3).subscribe((text) => this.helpText = text);
        this.gropValidator = true;
        break;
      case 'IE_VALIDATOR_EXPERT':
        obsFilter.filtreStatutValidation = 4;
        this.textService.getText(4).subscribe((text) => this.helpText = text);
        this.expertValidator = true
        break;
      default:
        break;
    }
    this.observationService.getObservations({
      paginStart: paginStart,
      paginEnd: paginEnd
    }, obsFilter)
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
                cd_nom: [this.selectedObs.cdNom]
              }, FormValidator.especeValidator],
              //especeSupra: [''],
              comment: [this.selectedObs.validation.commentaireValidation],
            });
          else
            this.validationForm = this.formBuilder.group({
              groupOP: ['', Validators.required],
              espece: ['', FormValidator.especeValidator],
              //especeSupra: [''],
              comment: [this.selectedObs.validation.commentaireValidation]
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
    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        this.validateObs(obs.idData, obs.groupSimple)
        break;
      case 'IE_VALIDATOR_GROPE':
        if (obs.groupeOP) {
          this.validateObs(obs.idData, obs.groupSimple, obs.groupOP)
        }
        else console.log("shortcut gop error");
        break;
      case 'IE_VALIDATOR_EXPERT':
        if (obs.groupeOP && obs.cdNom != 0 && obs.cd_ref != 0) {
          this.validateObs(obs.idData, obs.groupSimple,
            obs.cdGroupOP, obs.cd_nom, obs.cd_ref)
        }
        else {
          console.log("shortcut error espece");
        }
        break;
      default:
        break;
    }
  }

  submit(obsForm) {
    //console.log("obsForm especeValid", obsForm.errors.especeValid);
    console.log("obsForm", obsForm);
    {
      switch (this.userRole) {
        case 'IE_VALIDATOR_GRSIMPLE':
          this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple, null, null, null, obsForm.value.comment)
          break;
        case 'IE_VALIDATOR_GROPE':
          if (obsForm.controls.groupOP.valid) {
            this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple, obsForm.value.groupOP, null, null, obsForm.value.comment)
            this.selectedObs.cdGroupOP = obsForm.value.groupOP;
            this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP) })
          }
          else console.log("form error");
          break;
        case 'IE_VALIDATOR_EXPERT':
          if (obsForm.valid) {
            if (typeof obsForm.value.espece == "object") {
              this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple,
                obsForm.value.groupOP, obsForm.value.espece.cd_nom[0], obsForm.value.espece.cd_ref, obsForm.value.comment)
              this.selectedObs.cdGroupOP = obsForm.value.groupOP;
              this.selectedObs.nomCompletHtml = obsForm.value.espece.nom_complet_html_valide;
              this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP) })
            }
            else if (typeof obsForm.value.especeSupra == "object") {
              this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple,
                obsForm.value.groupOP, obsForm.value.especeSupra.cdNom, obsForm.value.especeSupra.cdRef, obsForm.value.comment)
              this.selectedObs.cdGroupOP = obsForm.value.groupOP;
              this.selectedObs.nomCompletHtml = obsForm.value.especeSupra.nomCompletHtml;
              this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP) })
            }
            else {
              console.log("form error espece");

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

  supraSearch() {
    this.advencedSearch = !this.advencedSearch;
    if (this.advencedSearch) {
      this.supraEspeceText = "+ Nom de l'espèce";
      this.validationForm.addControl('especeSupra', new FormControl(''));
      this.validationForm.controls['especeSupra'].setValidators(FormValidator.supraValidator);
      this.validationForm.removeControl('espece');

    }
    else {
      this.supraEspeceText = "+ trouver l'espèce par niveau supérieur ?";
      this.validationForm.addControl('espece', new FormControl(''));
      this.validationForm.controls['espece'].setValue({
        nom_complet_valide: this.selectedObs.nomComplet,
        cd_ref: this.selectedObs.cdRef,
        cd_nom: [this.selectedObs.cdNom]
      });
      this.validationForm.controls['espece'].setValidators(FormValidator.especeValidator);
      this.validationForm.removeControl('especeSupra')

    }
  }

  strip_html_tags(str) {
    if ((str == null) || (str == ''))
      return false;
    else
      str = str.toString();
    return str.replace(/<[^>]*>/g, '');
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


  especeSup = (value: any) => this.strip_html_tags(value.nomCompletHtml) || '';
  searchEspeceSup = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.observationService.getEspeceSupra(term)
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
