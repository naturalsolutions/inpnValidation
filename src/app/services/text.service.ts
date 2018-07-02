import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Conf } from '../conf';

@Injectable()
export class TextService {
 
  constructor(public http: HttpClient) { }
  getText(id) {
    return this.http.get(Conf.apiBaseUrl +'text/web/'+id);
  }
}
