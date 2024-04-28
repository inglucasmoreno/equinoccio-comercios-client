import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/config-generales';

@Injectable({
  providedIn: 'root'
})
export class ConfigGeneralesService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getConfigGeneral(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  actualizarLogoEmpresa(formData: any): Observable<any> {
    return this.http.post(`${urlApi}/logoEmpresa`, formData, {
      headers: { 'Authorization': localStorage.getItem('token') }
    });
  }


  listarConfigGenerales({ direccion = 'desc', columna = 'id' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna
      },
    })
  }

  nuevaConfigGeneral(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarConfigGeneral(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
