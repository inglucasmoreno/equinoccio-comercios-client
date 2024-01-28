import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/gastos-cajas';

@Injectable({
  providedIn: 'root'
})
export class GastosCajasService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getGastoCaja(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarGastosCajas({ direccion = 'desc', columna = 'id', caja = '' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        caja
      },
      headers: this.getToken
    })
  }

  nuevoGastoCaja(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarGastoCaja(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  eliminarGastoCaja(id: number): Observable<any> {
    return this.http.delete(`${urlApi}/${id}`,{
      headers: this.getToken
    })
  }

}
