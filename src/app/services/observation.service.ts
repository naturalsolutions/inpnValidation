import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Conf } from '../conf';
import * as _ from "lodash";
@Injectable()
export class ObservationService {

  constructor(public http: HttpClient) { }

  getObservations(pagination?, filtreObs?) {
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
    return this.http.get<obs>(Conf.apiBaseUrl + 'data', { params: httpParams });
  }

  getlistGroupOP(groupSimple?) {  
    let httpParams = new HttpParams();
    if (groupSimple) {
        httpParams = httpParams.append("ggpCode", groupSimple);
    }
    return this.http.get<any[]>(Conf.apiBaseUrl2 + 'mobile/biodiv/listgroupop/json', { params: httpParams });
  }


  getEspece(textSearch) {
    console.log("ee",textSearch);
 
    let httpParams = new HttpParams();
    if (textSearch.length > 1) {
        httpParams = httpParams.append("texte", textSearch);
    }
    return this.http.get<any>(Conf.apiBaseUrl2 + 'autocomplete/especes/recherche', { params: httpParams })
    .map(res => res= _.values(_.mapValues(res.response.docs, 'nom_complet_valide'))

      )
  }
}
//_.find(res.response.docs, { "cd_groupe_grand_public": 504 }).lb_nom

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