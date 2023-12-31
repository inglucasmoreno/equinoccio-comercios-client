import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/unidades-medida';

@Injectable({
  providedIn: 'root'
})
export class UnidadesMedidaService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getUnidad(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarUnidades({ direccion = 1, columna = 'descripcion' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: this.getToken
    })
  }

  nuevaUnidad(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarUnidad(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
