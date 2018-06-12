import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Conf } from '../conf';

@Injectable()

export class ObsGuard implements CanActivate {

    private userProfile;
    constructor(protected router: Router, private http: HttpClient) {
    }
    canActivate(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (localStorage.getItem('inpnUser_Access_token')) {

                let token = localStorage.getItem('inpnUser_Access_token');
                let params = new HttpParams()
                    .set('access_token', token);
                this.http.get(Conf.casBaseUrl + "profile", { params: params })
                    .subscribe(
                        (user) => { this.userProfile = user },
                        (error) => {
                            this.router.navigate(['home']);
                            return resolve(false)
                        },
                        () => {
                            return resolve(true)
                        }
                    );
            } else {
                this.router.navigate(['home']);
                resolve(false)
            }
        })
    }







}
