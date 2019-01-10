import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Conf } from '../conf';

@Injectable()
export class ObservationService {

  constructor(public http: HttpClient) { }

  getObservations(pagination?, filtreObs?) {

    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let httpParams = new HttpParams();
    if (pagination) {
      Object.keys(pagination).forEach(function (key) {
        httpParams = httpParams.append(key, pagination[key]);
      });
    }
    if (filtreObs) {
      Object.keys(filtreObs).forEach(function (key) {
        if (filtreObs[key])
          httpParams = httpParams.append(key, filtreObs[key]);
      });
    }
    return this.http.get<obs>(Conf.apiBaseUrl + 'data', { params: httpParams, headers });
  }


  getMapObservations(filtreObs?) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let httpParams = new HttpParams();
    httpParams = httpParams.append('forMap', 'true');
    if (filtreObs) {
      Object.keys(filtreObs).forEach(function (key) {
        if (filtreObs[key])
          httpParams = httpParams.append(key, filtreObs[key]);
      });
    }
    return this.http.get<obs>(Conf.apiBaseUrl + 'data', { params: httpParams, headers });
  }




  getObsByID(id) {
    let token = localStorage.getItem('inpnUser_Access_token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
      .set('Authorization', 'Bearer ' + token);
    return this.http.get<any>(Conf.apiBaseUrl + 'data/' + id);
  }

  getlistGroupOP(groupSimple?) {
    let httpParams = new HttpParams();
    if (groupSimple) {
      httpParams = httpParams.append("ggpCode", groupSimple);
    }
    return this.http.get<any[]>(Conf.apiBaseUrl2 + 'mobile/biodiv/listgroupop/json', { params: httpParams });
  }

  getEspece(textSearch, groupOP) {
    let httpParams = new HttpParams();
    httpParams = httpParams.append("cd_group_op", groupOP);
    if (textSearch.length > 1) {
      httpParams = httpParams.append("texte", textSearch);
    }
    return this.http.get<any>(Conf.apiBaseUrl2 + 'autocomplete/especes/recherche', { params: httpParams })
      .map(res => res = res.response.docs)
  }

  getEspeceSupra(textSearch) {
    let httpParams = new HttpParams();
    if (textSearch.length > 1) {
      httpParams = httpParams.append("nomScientifique", textSearch);
    }
    return this.http.get<any>(Conf.taxrefUrl + 'rangTaxonomique=KD&rangTaxonomique=PH&rangTaxonomique=CL&rangTaxonomique=OR&rangTaxonomique=FM&rangTaxonomique=SBFM&rangTaxonomique=TR&rangTaxonomique=GN&simpleRecord=true', { params: httpParams })
      .map(res => res = res.taxons.taxonSimpl)
  }

  getLocalization(textSearch) {
    let httpParams = new HttpParams();

    if (textSearch.length > 1) {
      httpParams = httpParams.append("texte", textSearch);
    }
    return this.http.get<any>(Conf.apiBaseUrl2 + 'autocomplete/communes/recherche', { params: httpParams })
      .map(res => res = res.response.docs)
  }

  getPseudo(textSearch) {
    let httpParams = new HttpParams();
    httpParams = httpParams.append("s", textSearch);
    return this.http.get<any>(Conf.apiBaseUrl + 'users/ac/pseudo', { params: httpParams })
  }


  getGroupeSimple() {
    return this.http.get<any[]>(Conf.apiBaseUrl2 + 'mobile/biodiv/groupgp/json');
  }

  getValidationStatus() {
    return this.http.get<any[]>(Conf.apiBaseUrl + 'validation/status');
  }

  getValidationHistory(dataId) {
    return this.http.get<any[]>(Conf.apiBaseUrl + 'validation/data/' + dataId + '/historique');
  }

  getObservationScore(dataId) {
    return this.http.get<any[]>(Conf.apiBaseUrl + 'score/iddata/' + dataId);
  }

  validateObs(idData: string, idValidateur: string, isValidated: string,
    idStatus: string, groupSimple?, groupOP?, cdNom?, cdRef?, comment?) {
    let httpParams = new HttpParams();
    let validateObj = {
      'idData': idData,
      'idValidateur': idValidateur,
      'isValidated': isValidated,
      'idStatus': idStatus,
    }
    if (groupSimple)
      validateObj['groupSimple'] = groupSimple;
    if (groupOP)
      validateObj['groupOP'] = groupOP;
    if (cdNom)
      validateObj['cdNom'] = cdNom;
    if (cdRef)
      validateObj['cdRef'] = cdRef;
    if (comment)
      validateObj['commentStatus'] = comment;
    Object.keys(validateObj).forEach(function (key) {
      httpParams = httpParams.append(key, validateObj[key]);
    });
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(Conf.apiBaseUrl + 'validation/', httpParams.toString(), { headers, observe: 'response' })
  }
}

interface obs {
  totLines: number,
  observations: [any]
}