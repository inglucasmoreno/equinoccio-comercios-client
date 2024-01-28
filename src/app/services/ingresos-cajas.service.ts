import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/ingresos-cajas';

@Injectable({
  providedIn: 'root'
})
export class IngresosCajasService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getIngresoCaja(id: number): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarIngresosCajas({ direccion = 'desc', columna = 'id', caja = '' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        caja
      },
      headers: this.getToken
    })
  }

  nuevoIngresoCaja(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarIngresoCaja(id: number, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  eliminarIngresoCaja(id: number): Observable<any> {
    return this.http.delete(`${urlApi}/${id}`,{
      headers: this.getToken
    })
  }

}
