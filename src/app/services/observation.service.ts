import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Conf } from '../conf';
import * as _ from "lodash";
@Injectable()
export class ObservationService {

  constructor(public http: HttpClient) { }

  getObservations(pagination?, filtreObs?) {


    let token = localStorage.getItem('inpnUser_Access_token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
      .set('Authorization', 'Bearer ' + token);
    let params = new HttpParams()
      .set('access_token', token)
    let httpParams = new HttpParams();
    if (pagination) {
      Object.keys(pagination).forEach(function (key) {
        httpParams = httpParams.append(key, pagination[key]);
      });
    }
    if (filtreObs) {
      Object.keys(filtreObs).forEach(function (key) {
        httpParams = httpParams.append(key, filtreObs[key]);
      });
    }
    return this.http.get<obs>(Conf.apiBaseUrl + 'data', { params: httpParams, headers });
  }

  getlistGroupOP(groupSimple?) {
    let httpParams = new HttpParams();
    if (groupSimple) {
      httpParams = httpParams.append("ggpCode", groupSimple);
    }
    return this.http.get<any[]>(Conf.apiBaseUrl2 + 'mobile/biodiv/listgroupop/json', { params: httpParams });
  }


  getEspece(textSearch) {
    console.log("ee", textSearch);

    let httpParams = new HttpParams();
    if (textSearch.length > 1) {
      httpParams = httpParams.append("texte", textSearch);
    }
    return this.http.get<any>(Conf.apiBaseUrl2 + 'autocomplete/especes/recherche', { params: httpParams })
      .map(res => res = _.values(_.mapValues(res.response.docs, 'nom_complet_valide'))

      )
  }
  getGroupeSimple() {
    return this.http.get<any[]>(Conf.apiBaseUrl2 + 'mobile/biodiv/groupgp/json');
  }



  validateObs(idData: string, idValidateur: string, isValidated: string, idStatus: string, groupSimple?,groupOP?) {

    let httpParams = new HttpParams();
    let validateObj = {
      'idData': idData,
      'idValidateur': idValidateur,
      'isValidated': isValidated,
      'idStatus': idStatus
    }
    if (groupSimple) 
      validateObj['groupSimple']=groupSimple;
      if (groupOP) 
      validateObj['groupOP']=groupOP;


    Object.keys(validateObj).forEach(function (key) {
      httpParams = httpParams.append(key, validateObj[key]);
    });

   

    console.log("body", httpParams);

    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(Conf.apiBaseUrl + 'validation/', httpParams.toString(), { headers, observe: 'response' })

  }
}



interface pagination {
  paginStart: number,
  paginEnd: number
}


interface filtreObs {

  filtrePhotosValided?: string
  filtrePhotosTreated?: string
}

interface obs {
  totLines: number,
  observations: [any]
}