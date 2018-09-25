import { Component, OnInit, Output, Input, EventEmitter, Injectable } from '@angular/core';
import { ObservationService } from '../services/observation.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbDate, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
import { Observable, of } from 'rxjs';
import * as moment from 'moment';

const I18N_VALUES = {
  'fr': {
    weekdays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
    months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'],
  }
  // other languages you would support
};

@Injectable()
export class I18n {
  language = 'fr';
}

// Define custom service providing the months and weekdays translations
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {

  constructor(private _i18n: I18n) {
    super();
  }
  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }
  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }
  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [NgbDatepickerConfig, I18n, { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n }]
})
export class FilterComponent implements OnInit {
  @Output() filter = new EventEmitter();
  @Input() userRole: string;
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  filterForm: FormGroup;
  groupSimpleFilter;
  showFilter: boolean = false;
  listGroupeSimple;
  listGroupeSimpleArray: any;
  listGroupOP: any[];
  model: NgbDateStruct;
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
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);
  searching: boolean = false;
  searchFailed: boolean = false;
  from: any;
  to: any;
  calendarActivate: boolean = true;
  startDate: any;
  ValidationStatus: any;

  constructor(
    private observationService: ObservationService,
    private formBuilder: FormBuilder,
    public calendar: NgbCalendar,
    datePickerConfig: NgbDatepickerConfig
  ) {
    datePickerConfig.outsideDays = 'hidden';
  }

  ngOnInit() {
    this.observationService.getValidationStatus()
      .subscribe(
        (data) => this.ValidationStatus = data,
        (error) => console.log("getValidationStatusErr", error),
      );
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
                  groupOp: [],
                  taxon: [],
                  pseudo: [],
                  cdSig: [],
                  dateInf: [],
                  dateSup: [],
                  filtrestatuValidation: []
                });
                this.filterForm.controls['dateInf'].statusChanges
                  .subscribe(() => {
                    if (this.filterForm.controls['dateInf'].value) {
                      this.startDate = this.filterForm.controls['dateInf'].value;
                      this.filterForm.controls['dateSup'].setValue(this.startDate);
                      this.calendarActivate = false;
                    }
                  })
              }
            )

        });
  }

  modifyGrpSimple(grpSimple) {
    this.groupSimpleFilter = grpSimple;
    this.filterForm.controls["groupOp"].reset()
    this.filterForm.controls["taxon"].reset()
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
    console.log('filterForm',filterForm);
    
    if (this.groupSimpleFilter)
      this.filterForm.value.groupSimple = this.groupSimpleFilter.cdGroupGrandPublic;
    if (this.filterForm.value.dateInf)
      this.filterForm.value.dateInf = moment(filterForm.value.dateInf).toISOString();
    if (this.filterForm.value.dateSup)
      this.filterForm.value.dateSup = moment(filterForm.value.dateSup).toISOString();
    this.filter.emit(filterForm.value);
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

  formatMatches = (value: any) => value.nom_complet_valide || '';
  search = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.observationService.getEspece(term, this.filterForm.controls['groupOp'].value)
          .do(() => {
            this.searchFailed = false
          })
          .catch(() => {
            this.searchFailed = true;
            return of([]);
          }))
      .do(() => this.searching = false)
      .merge(this.hideSearchingWhenUnsubscribed);

  city = (value: any) => this.dptNum(value) || '';
  searchCity = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.observationService.getLocalization(term)
          .do(() => {
            this.searchFailed = false
          })
          .catch(() => {
            this.searchFailed = true;
            return of([]);
          }))
      .do(() => this.searching = false)
      .merge(this.hideSearchingWhenUnsubscribed);



  dptNum(value) {
    if ((value == null) || (value == ''))
      return false;
    else {
      var ville;
      var dptNum = value.cd_sig_dep.replace('INSEED', '');
      ville = (value.lb_adm_tr + ' (' + dptNum + ')');
    }

    return ville;
  }

  pseudo = (value: any) => value.pseudo || '';
  searchPseudo = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.observationService.getPseudo(term)
          .do(() => {
            this.searchFailed = false
          })
          .catch(() => {
            this.searchFailed = true;
            return of([]);
          }))
      .do(() => this.searching = false)
      .merge(this.hideSearchingWhenUnsubscribed);






}
