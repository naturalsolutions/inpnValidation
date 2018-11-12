import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Conf } from '../conf';
import { User } from "../shared/user";
import * as _ from "lodash";

@Injectable()

export class GrpTaxoGuard implements CanActivate {
    private apiUrl = Conf.apiBaseUrl;
    public userProfile: User;
    constructor(protected router: Router, private http: HttpClient) {
    }
    canActivate(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (localStorage.getItem('inpnUser_Access_token')) {

                let token = localStorage.getItem('inpnUser_Access_token');
                let params = new HttpParams()
                    .set('access_token', token);
                this.http.get<User>(Conf.casBaseUrl + "profile", { params: params })
                    .subscribe(
                        (user) => { this.userProfile = user },
                        (error) => { return resolve(false) },
                        () => {
                            let roles = this.userProfile.attributes.GROUPS.split(",");
                            if (_.includes(roles, 'IE_VALIDATOR_GROPE'))
                                return resolve(true)
                            else {
                                this.router.navigate(['home']);
                                return resolve(false)
                            }
                        }
                    );
            } else {
                this.router.navigate(['home']);
                resolve(false)
            }
        })
    }







}
