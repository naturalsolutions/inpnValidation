import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/first';
import { FilterService } from '../services/filter.service';
import { log } from 'util';
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
  mySubscription: any;


  constructor(
    private userService: UserService,
    protected router: Router,
    private filterService: FilterService
  ) { }

  ngOnInit() {
    this.userService.getCurrentUser()
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
    this.userService.logout();
    this.filterService.setFilterNotifications(0);
    this.router.navigate(['home']);
    this.filterService.setFilter('init');
  }

  myProfil() {
    // ###### can reload the same route #######
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.router.navigated = false;
      }
    })
    // ##########
    this.router.navigate(['/profil', this.currentUser.attributes.ID_UTILISATEUR])
  }

  ngOnDestroy() {
    if (this.mySubscription)
      this.mySubscription.unsubscribe();
  }
}
