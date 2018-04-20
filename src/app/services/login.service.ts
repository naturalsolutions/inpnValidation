import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Conf } from '../conf';
import { User } from "../user";
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

@Injectable()
export class LoginService {

  public userProfile;
  private userStatus: BehaviorSubject<any> = new BehaviorSubject('');
  constructor(public http: HttpClient) { }

  login(username: string, password: string) {
    let body = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('grant_type', "password")
      .set('client_id', "inpnespeces");
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post(Conf.casBaseUrl + "accessToken", body.toString(),
      { headers, responseType: "text" })
  }

  getUser() {
    let token = localStorage.getItem('inpnUser_Access_token');
    //let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    //.set('Authorization', 'Bearer ' + token);
    let params = new HttpParams()
      .set('access_token', token)
    return this.http.get<User>(Conf.casBaseUrl + "profile", { params: params })
  }

  refreshToken() {
    let refreshToken = localStorage.getItem('refresh_token');
    let body = new HttpParams()
      .set('client_secret', 'qy9yV3R6')
      .set('refresh_token', refreshToken)
      .set('grant_type', 'refresh_token')
      .set('client_id', 'inpnespeces');
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post(Conf.casBaseUrl + "accessToken", body.toString(),
      { headers, responseType: "text" })
  }


  logout() : Observable<any>{
    // remove user from local storage to log user out
    localStorage.removeItem('inpnUser_Access_token');
    localStorage.removeItem('inpnUser_refresh_token');
    this.userStatus.next(false);
    return this.userStatus.asObservable();
  }

  isconnected(): Promise<boolean> {
   
    return new Promise((resolve, reject) => {
      if (localStorage.getItem('inpnUser_Access_token')) {
        let token = localStorage.getItem('inpnUser_Access_token');
        let params = new HttpParams()
          .set('access_token', token)
        this.http.get(Conf.casBaseUrl + "profile", { params: params })
          .subscribe(
            (res) => {
              this.userProfile = res;
            },
            (error) => {
              if (error.error.error[0] = 'expired_accessToken') {
                console.log("getUserHeaderErr :  expired_accessToken")
                 this.refreshToken().subscribe((data) => console.log("data", data))
              }
              return resolve(false);
            },
            () => {
              this.userStatus.next(true);
              return resolve(true);
            }
          );

      } else {
        resolve(false)
      }
    })
  }
  getIsConnected(): Observable<any> {
    this.isconnected();
    return this.userStatus.asObservable();
  }

  setIsConnected(status:boolean) {
    this.userStatus.next(status);
  }



}