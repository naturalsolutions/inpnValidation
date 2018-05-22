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
  private paginStart: number = 1;
  private paginEnd: number = 12;
  private nbItems: number = 11;
  totalItems;
  private listGroupOP;
  refreshObs: boolean = false;
  principalPhoto: any;
  groupeOP: any;
  groupeSimple: any;
  listGroupeSimple;
  listGroupeSimpleArray: any;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);
  searching: boolean = false;
  searchFailed: boolean = false;
  expertValidator: boolean = false;
  gropValidator: boolean = false;;

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private authGuard: AuthGuard,
    private observationService: ObservationService) { }

  ngOnInit() {
    this.currentUser = this.authGuard.userProfile;
    this.userRole = this.currentUser.attributes.GROUPS

    this.getObs();
  }

  getObs() {
    this.spinner.show();
    let filtreStatutValidation
    switch (this.userRole) {
      case 'IE_VALIDATOR_GRSIMPLE':
        filtreStatutValidation = 2
        break;
      case 'IE_VALIDATOR_GROPE':
        filtreStatutValidation = 3;
        this.gropValidator = true
        break;
      case 'IE_VALIDATOR_EXPERT':
        filtreStatutValidation = 4;
        this.expertValidator = true
        break;
      default:
        break;
    }
    this.observationService.getObservations({
      paginStart: this.paginStart,
      paginEnd: this.paginEnd
    }, { "filtreStatutValidation": filtreStatutValidation })
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
                      _.map(this.observations.observations, (value) => {
                        value.groupeOP = _.find(this.listGroupOP, { "cdGroup": value.cdGroupOP });
                        return value
                      });
                      this.paginStart = this.paginEnd;
                      this.paginEnd += this.nbItems;
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

          this.selectedObs.groupeOP = _.find(this.listGroupOP, { "cdGroup": this.selectedObs.cdGroupOP });
          if (this.selectedObs.groupeOP)
            this.validationForm = this.formBuilder.group({
              groupOP: [this.selectedObs.groupeOP.cdGroup, Validators.required],
              espece: ['', Validators.required]
            });
          else
            this.validationForm = this.formBuilder.group({
              groupOP: ['', Validators.required],
              espece: ['', Validators.required]
            });

          this.validationForm.controls['groupOP'].statusChanges
            .subscribe((data) => {
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
    });
  }

  private getExtraObs() {
    if (this.paginStart <= this.totalItems)
      this.getObs();
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
    _.map(this.observations.observations, (value) => {
      if (value.idData == idData) {
        value.isTreated = true;
      }
      return value
    });
    this.observationService.validateObs(idData, idValidateur, isValidated,
      idStatus, groupSimple, groupOP, cdNom, cdRef).subscribe(
        (data) => {
          console.log("data", data);
          this.modalRef.close()
        },
        (error) => console.log("error val", error)

      )
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
            else { console.log("form error espece");
            this.validationForm.controls['espece'].setErrors({"err" : "error espece"})
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
