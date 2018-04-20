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
import { AuthGuard } from '../services/auth-guard.service';
import { User } from "../user";
@Component({
  selector: 'app-observations-list',
  templateUrl: './observations-list.component.html',
  styleUrls: ['./observations-list.component.scss']
})
export class ObservationsListComponent implements OnInit {

  icons = {
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
  modalRef: NgbModalRef;
  validationForm: FormGroup;
  currentUser: User;
  userRole: string;
  public obsLoaded: boolean = false;
  disableEspece: boolean;
  disableGrpOP: boolean;
  loadForm: boolean = false;
  valdidate;
  selectedObs: any;
  private observations;
  private paginStart: number = 1;
  private paginEnd: number = 12;
  private nbItems: number = 11;
  totalItems;
  private listGroupOP;
  principalPhoto: any;
  groupeOP: any;
  groupeSimple: any;
  listGroupeSimple;
  listGroupeSimpleArray: any;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);
  searching = false;
  searchFailed = false;

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private authGuard: AuthGuard,
    private observationService: ObservationService) { }

  ngOnInit() {
    this.currentUser = this.authGuard.userProfile;
    console.log("this.currentUser", this.currentUser);
    this.userRole = this.currentUser.attributes.GROUPS
    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        this.disableGrpOP = true
        this.disableEspece = true
        break;
      case 'IE_VALIDATOR_GROPE':
        this.disableGrpOP = false
        this.disableEspece = true
        break;
      case 'IE_VALIDATOR_EXPERT':
        this.disableGrpOP = false
        this.disableEspece = false
        break;
      default:
        break;
    }
    this.getObs();
  }

  getObs() {
    this.spinner.show();
    this.observationService.getObservations({
      paginStart: this.paginStart,
      paginEnd: this.paginEnd
    })
      .subscribe(
        (obs) => {
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
                  value.principalPhoto = _.find(value.photos, { "cdPhoto": value.cdPhotoPrincipal });
                  value.gpSipmle = _.find(this.listGroupeSimple.GroupGp, { "cdGroupGrandPublic": value.groupSimple })
                  return value
                });
                this.observationService.getlistGroupOP()
                  .subscribe(
                    (groupOP) => this.listGroupOP = groupOP,
                    (error) => console.log("getlistGroupOPErr", error),
                    () => {
                      console.log("this.listGroupOP_1", this.listGroupOP);
                      _.map(this.observations.observations, (value) => {
                        value.groupeOP = _.find(this.listGroupOP, { "cdGroup": value.cdGroupOP });
                        return value
                      });
                      console.log("obsList", this.observations.observations);
                      this.paginStart = this.paginEnd;
                      this.paginEnd += this.nbItems;
                      this.obsLoaded = true;
                      this.spinner.hide()
                      this.listGroupeSimpleArray = _.chunk(_.values(this.listGroupeSimple.GroupGp), 5);
                      console.log("listGroupeSimple", this.listGroupeSimpleArray)
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
          this.loadForm = true;
          console.log("this.listGroupOP", this.listGroupOP);
          this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": this.selectedObs.cdGroupOP });
          if (this.selectedObs.groupeOP)
            this.validationForm = this.formBuilder.group({
              groupOP: [{ value: this.selectedObs.groupeOP.cdGroup, disabled: this.disableGrpOP }],
              espece: [{ value: '', disabled: this.disableEspece }]
            });
          else
            this.validationForm = this.formBuilder.group({
              groupOP: [{ value: '', disabled: this.disableGrpOP }],
              espece: [{ value: '', disabled: this.disableEspece }]
            });
        }
      )
    console.log("this.selectedObs", this.selectedObs);
    this.modalService.open(content, { centered: true, windowClass: 'css-modal' }).result.then((result) => {
    }, (reason) => {
      _.map(this.listGroupeSimple.GroupGp, (value) => {
        if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
          value.selectedObs = ""
        return value
      });
    });
  }

  private getExtraObs() {
    if (this.paginStart <= this.totalItems)
      this.getObs();
  }
  private validateObs(idData, groupSimple?, groupOP?) {

    let idValidateur = (this.currentUser.attributes.ID_UTILISATEUR).toString();
    let idStatus = '3';
    let isValidated = 'false';
    console.log("this.currentUser.attributes.GROUPS", this.currentUser.attributes.GROUPS);

    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        idStatus = '4'
        break;
      case 'IE_VALIDATOR_GROPE':
        idStatus = '5'
        break;
      case 'IE_VALIDATOR_EXPERT':
        idStatus = '5'
        isValidated = 'true'
        break;
      default:
        break;
    }

    _.map(this.observations.observations, (value) => {
      if (value.idData == idData) {
        value.isTreated = true;
      }
      return value
    });
    console.log(this.observations.observations);
    this.observationService.validateObs(idData, idValidateur, isValidated, idStatus, groupSimple, groupOP).subscribe()
  }

  submit(obsForm) {
    console.log("obsForm", obsForm.value.groupOP);
    console.log("item", this.selectedObs);

    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple)
        break;
      case 'IE_VALIDATOR_GROPE':
        this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple, obsForm.value.groupOP)
        this.selectedObs.cdGroupOP=obsForm.value.groupOP;
        this.selectedObs.groupeOP=_.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP)})  
        break;
      case 'IE_VALIDATOR_EXPERT':
      this.validateObs(this.selectedObs.idData, this.selectedObs.groupSimple, obsForm.value.groupOP)
      this.selectedObs.cdGroupOP=obsForm.value.groupOP;
      this.selectedObs.groupeOP=_.find(this.listGroupOP, { "cdGroup": Number(this.selectedObs.cdGroupOP)})  
        break;
      default:
        break;
    }
  }

  modifyGrpSimple(grpSimple) {
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      if (this.selectedObs.groupSimple == value.cdGroupGrandPublic)
        value.selectedObs = ""
      return value
    });
    console.log("grpSimple", grpSimple);
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

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.observationService.getEspece(term)
          .do((aa) => this.searchFailed = false)
          .catch(() => {
            this.searchFailed = true;
            return of([]);
          }))
      .do(() => this.searching = false)
      .merge(this.hideSearchingWhenUnsubscribed);


}
