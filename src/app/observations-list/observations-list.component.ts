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

@Component({
  selector: 'app-observations-list',
  templateUrl: './observations-list.component.html',
  styleUrls: ['./observations-list.component.scss']
})
export class ObservationsListComponent implements OnInit {

  modalRef: NgbModalRef;
  validationForm: FormGroup;
  selectedObs: any;
  private observations;
  private paginStart: number = 1;
  private paginEnd: number = 12;
  private nbItems: number = 11;
  totalItems;
  private listGroupOP;
  public obsLoaded: boolean = false;
  principalPhoto: any;
  groupeOP: any;
  groupeSimple: any;
  ListGroupeSimple;
  model: any;
  searching = false;
  searchFailed = false;
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);

  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private observationService: ObservationService) { }

  ngOnInit() {

    this.ListGroupeSimple = {
      506: {
        label: "Amphibiens et reptiles",
        icons: "icon-reptile_amphibien"
      },
      501: {
        label: "Champignons et lichens",
        icons: "icon-champignon_lichen"
      },
      502: {
        label: "Crabes, crevettes, cloportes et mille-pattes",
        icons: "icon-crabe_crevette_cloporte_millepatte"
      },
      503: {
        label: "Escargots et autres mollusques",
        icons: "icon-escargot_mollusque"
      },
      504: {
        label: "Insectes et araignées",
        icons: "icon-insecte_araignee"
      },
      154: {
        label: "Mammifères",
        icons: "icon-mammifere"
      },
      148: {
        label: "Oiseaux",
        icons: "icon-oiseau"
      },
      505: {
        label: "Plantes, mousses et fougères",
        icons: "icon-plante_mousse_fougere"
      },
      158: {
        label: "Poissons",
        icons: "icon-poisson"
      },
      24222202: {
        label: "Autres",
        icons: "icon-more"
      },
    };

    this.getObs();

  }

  getObs() {
    this.spinner.show();
    console.log("paginStart", this.paginStart);
    console.log("paginEnd", this.paginEnd);
    this.observationService.getObservations({
      paginStart: this.paginStart,
      paginEnd: this.paginEnd
    })
      .subscribe(
        (obs) => {
          this.observations = obs;
          this.totalItems = obs.totLines;
          console.log('obsList', obs)
        },
        (error) => console.log("getObservationsErr", error),
        () => {
          _.map(this.observations.observations, (value) => {
            value.principalPhoto = _.find(value.photos, { "cdPhoto": value.cdPhotoPrincipal });
            value.gpSipmle = this.ListGroupeSimple[value.groupSimple];
            value.groupeOP = _.find(this.listGroupOP, { "cdGroup": 446 })
            return value
          });
          this.paginStart = this.paginEnd;
          this.paginEnd += this.nbItems;
          this.obsLoaded = true;
          this.spinner.hide()
        }
      )
  }
  open(content, obs) {
    this.selectedObs = obs;
    this.observationService.getlistGroupOP(this.selectedObs.groupSimple)
      .subscribe(
        (groupOP) => this.listGroupOP = groupOP,
        (error) => console.log("getlistGroupOPErr", error),
        () => {
          console.log("this.listGroupOP", this.listGroupOP);

        }
      )
    this.validationForm = this.formBuilder.group({
      groupSimple: [this.selectedObs.gpSipmle.label, Validators.required],
      groupOP: ['', Validators.required],
      espece: ['', Validators.required]
    })

    console.log("this.selectedObs", this.selectedObs);

    this.modalRef = this.modalService.open(content, { centered: true, windowClass: 'css-modal' })


  }


  getExtraObs() {
    if (this.paginStart <= this.totalItems)
      this.getObs();
  }


  search = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term => 
        this.observationService.getEspece(term)
          .do((aa) =>this.searchFailed = false)
          .catch(() => {
            this.searchFailed = true;
            return of([]);
          }))
      .do(() => this.searching = false)
      .merge(this.hideSearchingWhenUnsubscribed);


}
