import { Component, OnInit, Output, Input, EventEmitter, Injectable, OnChanges } from '@angular/core';
import { ObservationService } from '../services/observation.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbDatepickerConfig, NgbDatepickerI18n, NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";
import { FilterService } from '../services/filter.service';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { User } from "../shared/user";
import { icons } from "../shared/icons";
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
export class FilterComponent implements OnInit, OnChanges {
  @Output() filter = new EventEmitter();
  @Input() userId: User;
  @Input() validationFilter;
  filterForm: FormGroup;
  groupSimpleFilter;
  showFilter: boolean = false;
  listGroupeSimple;
  listGroupeSimpleArray: any;
  listGroupOP: any[];
  hideSearchingWhenUnsubscribed = new Observable(() => () => this.searching = false);
  searching: boolean = false;
  searchFailed: boolean = false;
  calendarActivate: boolean = true;
  startDate: any;
  ValidationStatus: any;
  showSatutsFilter: boolean = false;
  filterType: string;

  constructor(
    private observationService: ObservationService,
    private formBuilder: FormBuilder,
    public calendar: NgbCalendar,
    datePickerConfig: NgbDatepickerConfig,
    private filterService: FilterService
  ) {
    datePickerConfig.outsideDays = 'hidden';
  }
  ngOnChanges() {

  }
  ngOnInit() {
    if (this.validationFilter)
      this.filterService.setFilter('init')


    this.observationService.getValidationStatus()
      .subscribe(
        (data) => this.ValidationStatus = data,
        (error) => console.log("getValidationStatusErr", error),
        () => {
          _.remove(this.ValidationStatus.Status, (value) => {
            return value.cdRef == 0;
          });
        }

      );
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
                  filtreStatutValidation: [],
                  idUtilisateur: []
                });
                if (this.userId && !this.validationFilter) {
                  this.filterForm.controls['idUtilisateur'].setValue(true);
                  this.showSatutsFilter = true;
                  this.filterForm.value.idUtilisateur = this.userId

                }

                this.filterForm.controls['dateInf'].statusChanges
                  .subscribe(() => {
                    if (this.filterForm.controls['dateInf'].value) {
                      this.startDate = this.filterForm.controls['dateInf'].value;
                      this.filterForm.controls['dateSup'].setValue(this.startDate);
                      this.calendarActivate = false;
                    }
                  })
                this.filterForm.controls['idUtilisateur'].statusChanges
                  .subscribe((status) => {
                    if (this.filterForm.controls['idUtilisateur'].value == true)
                      this.showSatutsFilter = true
                    else
                      this.showSatutsFilter = false
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
    if (this.groupSimpleFilter)
      filterForm.value.groupSimple = this.groupSimpleFilter.cdGroupGrandPublic;
    if (filterForm.value.dateInf) {
      filterForm.value.dateInf = moment(filterForm.value.dateInf).month(filterForm.value.dateInf.month - 1).hours(1).toISOString();


    }
    if (filterForm.value.dateSup) {
      filterForm.value.dateSup = moment(filterForm.value.dateSup).month(filterForm.value.dateSup.month - 1).hours(1).toISOString();
      console.log(filterForm.value.dateSup);
    }
    if (filterForm.value.idUtilisateur)
      filterForm.value.idUtilisateur = this.userId
    this.filterService.setFilter(filterForm.value)
  }

  resetFilter() {
    this.filterForm.reset();
    this.calendarActivate = true;
    this.groupSimpleFilter = null;
    _.map(this.listGroupeSimple.GroupGp, (value) => {
      value.selectedObs = ""
      return value
    });
    this.filterService.setFilter(null)
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
