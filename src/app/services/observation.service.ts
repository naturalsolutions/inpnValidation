import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Conf } from '../conf';

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

  getlistGroupOP() {
    return this.http.get<any[]>(Conf.apiBaseUrl2 + 'mobile/biodiv/listgroupop/json');
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