import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

const urlApi = environments.base_url + '/ingresos';

@Injectable({
  providedIn: 'root'
})
export class IngresosService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getIngreso(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarIngresos({ 
    direccion = 'desc', 
    columna = 'id', 
    estado = '', 
    parametro = '', 
    fechaDesde = '',
    fechaHasta = ''
  }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        estado,
        parametro,
        fechaDesde,
        fechaHasta
      },
      headers: this.getToken
    })
  }

  completarIngreso(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/completar/${id}`, data, {
      headers: this.getToken
    })
  }

  nuevoIngreso(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarIngreso(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
