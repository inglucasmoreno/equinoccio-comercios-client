import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';
import { generales } from '../constants/generales';

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

  generarComprobante(id: string): Observable<any> {
    return this.http.get(`${urlApi}/generar/comprobante/${id}`, {
      headers: this.getToken
    })
  }

  generarComprobanteFiscal(id: string): Observable<any> {
    return this.http.get(`${urlApi}/generar/comprobante/fiscal/${id}`, {
      headers: this.getToken
    })
  }

  generarComprobanteFiscalTipoA(id: string): Observable<any> {
    return this.http.get(`${urlApi}/generar/comprobante/fiscal-tipo-a/${id}`, {
      headers: this.getToken
    })
  }

  proximoNumeroFactura(tipoFactura: string = 'B'): Observable<any> {
    return this.http.get(`${urlApi}/afip/proximo-numero-factura/${tipoFactura}`, {
      headers: this.getToken
    })
  }

  datosContribuyente(CUIT: string): Observable<any> {
    return this.http.get(`${urlApi}/afip/datos-contribuyente/${CUIT}`, {
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
    cajaId = '',
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
        cajaId,
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

  nuevaVentaFacturacion(data: any): Observable<any> {
    return this.http.post(`${urlApi}/facturacion`, data, {
      headers: this.getToken
    })
  }

  actualizarVenta(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  actualizarVentaFacturacionB(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/facturacion-b/${id}`, data, {
      headers: this.getToken
    })
  }

}
