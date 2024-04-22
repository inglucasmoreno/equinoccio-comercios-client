import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

const urlApi = environments.base_url + '/config-afip';

@Injectable({
  providedIn: 'root'
})
export class ConfigAfipService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getConfiguraciones(): Observable<any> {
    return this.http.get(`${urlApi}`, {
      headers: this.getToken
    })
  }

  crearConfiguraciones(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarConfiguraciones(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
