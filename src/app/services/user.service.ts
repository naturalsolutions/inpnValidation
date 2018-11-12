import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Conf } from '../conf';
import { User } from "../shared/user";
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class UserService {

  public userProfile;
  private userStatus: BehaviorSubject<any> = new BehaviorSubject('');
  constructor(public http: HttpClient) { }

  login(username: string, password: string) {
    let body = new URLSearchParams();
    body.set('grant_type', "password");
    body.set('client_id', "inpnespeces");
    body.set('username', username);
    body.set('password', password);
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post(Conf.casBaseUrl + "accessToken", body.toString(),
      { headers, responseType: "text" })
  }

  
  refreshToken() {
    let refreshToken = localStorage.getItem('inpnUser_refresh_token');
    let body = new HttpParams()
      .set('client_secret', 'qy9yV3R6')
      .set('refresh_token', refreshToken)
      .set('grant_type', 'refresh_token')
      .set('client_id', 'inpnespeces');
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post(Conf.casBaseUrl + "accessToken", body.toString(),
      { headers, responseType: "text" })
  }


  logout(): Observable<any> {
    // remove user from local storage to log user out
    localStorage.removeItem('inpnUser_Access_token');
    localStorage.removeItem('inpnUser_refresh_token');
    this.userStatus.next(false);
    return this.userStatus.asObservable();
  }

  getCurrentUser(): Promise<User> {

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
                console.log("getCurrentUserErr :  expired_accessToken")
                this.refreshToken()
                  .subscribe(
                    (data) => console.log("user"),
                    (error) => {
                      console.log("refreshTokenErr", error);
                      localStorage.removeItem('inpnUser_Access_token');
                      localStorage.removeItem('inpnUser_refresh_token');
                    })
              }
              return reject(error);
            },
            () => {
              this.userStatus.next(true);
              return resolve(this.userProfile);
            }
          );

      } else {
        reject(false)
      }
    })
  }
  getIsConnected(): Observable<any> {
    return this.userStatus.asObservable();
  }

  setIsConnected(status: boolean) {
    this.userStatus.next(status);
  }

  getProfil(userID) {
    return this.http.get<any>(Conf.apiBaseUrl + "contributor/" +userID)
  }

  getUsersRank(){
    return this.http.get<any>(Conf.apiBaseUrl + "rank" )

  }

}