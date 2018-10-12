import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import 'rxjs/add/operator/first';
import { FilterService } from '../services/filter.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userConnected: boolean = false;
  @Output() user = new EventEmitter();
  private currentUser: any;
  public isCollapsed = true;
  loadHeader: boolean = false;


  constructor(
    private loginService: LoginService,
    protected router: Router,
    private filterService :FilterService
  ) { }

  ngOnInit() {
    this.loginService.getCurrentUser()
      .then((currentUser) => {
        this.currentUser = currentUser;
        this.user.emit(this.currentUser)
        this.loadHeader = true;
        this.userConnected = true;
      },
        (error) => {
          this.loadHeader = true;
          this.userConnected = false;
          this.user.emit(null)
        })
  }


  logout() {
    this.userConnected = false;
    this.loginService.logout();
    this.filterService.setFilterNotifications(0);
    this.router.navigate(['home']);
    this.filterService.setFilter('init');
  }


}
