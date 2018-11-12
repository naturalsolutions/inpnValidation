import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from "lodash";

@Component({
  selector: 'app-observers-list',
  templateUrl: './observers-list.component.html',
  styleUrls: ['./observers-list.component.scss']
})
export class ObserversListComponent implements OnInit {
  users: any;
  usersLoaded: boolean = false;
  totalItems;
  private currentPage: number = 0;
  private nbItems: number = 15;
  private previousPage: number = 1;
  all_users: any;

  constructor(
    private userService: UserService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.usersRank()
  }

  usersRank() {
    this.spinner.show();
    this.userService.getUsersRank()
      .subscribe(
        (users) => {
          this.totalItems = users.totLines;
          this.all_users = users.Scores;
        },
        (error) => console.log("userService.getUsersRank error", error),
        () => {
          _.map(this.all_users, (value) => {
            value.score = new Intl.NumberFormat().format(value.score)
          })
          this.getUserPerPage(this.all_users, this.currentPage, this.nbItems)
          this.usersLoaded = true;
          this.spinner.hide();
        }
      )
  }

  getUserPerPage(users, paginStart, paginEnd) {
    this.users = _.slice(users, paginStart, paginEnd);
  }

  loadPage(page: number) {
    let paginStart;
    let paginEnd;
    if (page !== this.previousPage) {
      if (page > 1)
        paginStart = this.nbItems * (page - 1) + 1;
      else
        paginStart = 0;
      this.previousPage = page;
      paginEnd = paginStart + this.nbItems - 1;
      this.getUserPerPage(this.all_users, paginStart, paginEnd);
      window.scrollTo(0, 0);
    }
  }


}
