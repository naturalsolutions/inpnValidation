import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private homeStyle = "homeStyle";
  userConnected: boolean = false;

  constructor(
    private loginService: LoginService
  ) { }
  ngOnInit() {
    this.loginService.getIsConnected().subscribe(
      (isConnected) => {
        this.userConnected = isConnected;
      })
  }

}
