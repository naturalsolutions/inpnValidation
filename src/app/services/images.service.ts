import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Conf } from '../conf';
import 'rxjs/add/operator/map';
@Injectable()
export class ImagesService {

  constructor(public http: HttpClient) { }

  getPhotos(pagination?: pagination, filtrePhoto?: filtrePhoto) {
    let httpParams = new HttpParams();
    if (pagination) {
      Object.keys(pagination).forEach(function (key) {
        httpParams = httpParams.append(key, pagination[key]);
      });
    }
    if (filtrePhoto) {
      Object.keys(filtrePhoto).forEach(function (key) {
        httpParams = httpParams.append(key, filtrePhoto[key]);
      });
    }
    return this.http.get<photos>(Conf.apiBaseUrl + 'data/photo', { params: httpParams });
  }

  validatePhoto(cdPhoto: string, idValidateur: string, isValidated: string) {
    let body = new HttpParams()
      .set('idValidateur', idValidateur)
      .set('isValidated', isValidated);
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    console.log("cdPhoto", cdPhoto);

    return this.http.post<any>(Conf.apiBaseUrl + 'validation/photo/' + cdPhoto, body.toString(),
      { headers, observe: 'response' })

  }

}

interface pagination {
  paginStart: number,
  paginEnd: number
}
interface photos {
  totLines: number,
  Photos: [any]
}
interface filtrePhoto {

  filtrePhotosValided?: string
  filtrePhotosTreated?: string
}