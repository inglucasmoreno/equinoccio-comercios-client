import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

const urlApi = environments.base_url + '/ventas';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getVenta(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarVentas({ 
    activo = '',
    direccion = 'desc',
    comprobante = '', 
    formaPago = '',
    pagina = 1,
    itemsPorPagina = 100000,
    fechaDesde = '',
    fechaHasta = '',
    columna = 'createdAt' 
  }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        activo,
        comprobante,
        formaPago,
        direccion: String(direccion),
        columna,
        pagina,
        fechaDesde,
        fechaHasta,
        itemsPorPagina
      },
      headers: this.getToken
    })
  }

  nuevaVenta(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarVenta(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}