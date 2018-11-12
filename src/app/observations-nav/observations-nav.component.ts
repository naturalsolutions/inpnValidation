import { Component, OnInit, Input } from '@angular/core';
import { User } from "../shared/user";
import * as _ from "lodash";
import { FilterService } from '../services/filter.service'

@Component({
  selector: 'observations-nav',
  templateUrl: './observations-nav.component.html',
  styleUrls: ['./observations-nav.component.scss']
})
export class ObservationsNavComponent implements OnInit {

  isCollapsed = true;
  @Input() navItem: string;
  @Input() validator;
  @Input() validationText: String = "Validation";
  showFilter: boolean = true;
  filterSelected: boolean = false;
  mySubscription;
  mySubscription2;
  validation = 'groupeSimple';
  nbfilterSelected;
  validationFilter: boolean = false;

  constructor(private filterService: FilterService) {

  }

  ngOnInit() {
    if (this.navItem == 'photo')
      this.showFilter = false;
    this.mySubscription = this.filterService.getFilterNotifications().subscribe(
      (nbFilter) => {
        Promise.resolve().then(() => {
          this.nbfilterSelected = nbFilter;
          if (this.nbfilterSelected == 0)
            this.filterSelected = false
          else
            this.filterSelected = true
        });
      })
    this.mySubscription2 = this.filterService.getFilter().subscribe(
      (filter) => {
        if (filter != 'init') {
          this.isCollapsed = true
        }
      })
  }


  ngOnDestroy() {
    if (this.mySubscription)
      this.mySubscription.unsubscribe();
    if (this.mySubscription2)
      this.mySubscription2.unsubscribe();
  }
}


