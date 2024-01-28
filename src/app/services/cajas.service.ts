import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/cajas';

@Injectable({
  providedIn: 'root'
})
export class CajasService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getCaja(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  getTotalesActivos(id: string): Observable<any> {
    return this.http.get(`${urlApi}/totales/activos/${id}`, {
      headers: this.getToken
    })
  }

  listarCajas({ direccion = 'desc', columna = 'id', activo = '', fechaDesde = '', fechaHasta = '' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        activo,
        fechaDesde,
        fechaHasta
      },
      headers: this.getToken
    })
  }

  nuevaCaja(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  completarCaja(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/complete/${id}`, data, {
      headers: this.getToken
    })
  }

  actualizarCaja(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
