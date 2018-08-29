import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ObservationService } from '../services/observation.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as _ from "lodash";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output() filter = new EventEmitter();
  filterForm: FormGroup;
  groupSimpleFilter;
  showFilter: boolean = false;
  listGroupeSimple;
  listGroupeSimpleArray: any;
  listGroupOP: any[];
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

  constructor(
    private observationService: ObservationService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {

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
          this.listGroupeSimpleArray = _.chunk(_.values(this.listGroupeSimple.GroupGp), 5);
          this.observationService.getlistGroupOP()
            .subscribe(
              (groupOP) => this.listGroupOP = groupOP,
              (error) => console.log("getlistGroupOPErr", error),
              () => {
                this.showFilter = true;
                this.filterForm = this.formBuilder.group({
                  CD_GROUPE_OP: [''],
                });
              }
            )
        });
  }

  modifyGrpSimple(grpSimple) {
    this.groupSimpleFilter = grpSimple;
    this.filterForm.controls["CD_GROUPE_OP"].reset()
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      value.selectedObs = ""
      return value
    });
    this.observationService.getlistGroupOP(grpSimple.cdGroupGrandPublic)
      .subscribe(
        (groupOP) => this.listGroupOP = groupOP,
        (error) => console.log("getlistGroupOPErr", error),
        () => {
          _.map(this.listGroupeSimple.GroupGp, (value) => {
            if (grpSimple.cdGroupGrandPublic == value.cdGroupGrandPublic)
              value.selectedObs = "btn-selected"
            return value
          });
        }
      )
  }
  submit(filterForm) {
    let newFilter;
    if (!filterForm.value.CD_GROUPE_OP)
      newFilter = {
        "filtreName": "GROUPE_SIMPLE",
        "filtreValue": this.groupSimpleFilter.cdGroupGrandPublic
      };
    else
    newFilter = {
      "filtreName": "CD_GROUPE_OP",
      "filtreValue": filterForm.value.CD_GROUPE_OP
    };
    this.filter.emit(newFilter);
  }
resetFilter() {
  this.filterForm.reset();
  this.groupSimpleFilter = null;
  _.map(this.listGroupeSimple.GroupGp, (value) => {
    value.selectedObs = ""
    return value
  });
  this.filter.emit('reset');
  this.observationService.getlistGroupOP()
    .subscribe(
      (groupOP) => this.listGroupOP = groupOP,
      (error) => console.log("getlistGroupOPErr", error),
      () => {
        this.showFilter = true

      }
    )
}
}
