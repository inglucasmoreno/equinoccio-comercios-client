import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/tipos-gastos';

@Injectable({
  providedIn: 'root'
})
export class TiposGastosService {

  public estadoAbm: 'crear' | 'editar' = 'crear';
  public showModalAbm = false;
  public tipos: any[] = [];
  public tipoSeleccionado: any = null;
  public abmForm = { descripcion: '' };

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getTipo(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarTipos({ direccion = 'desc', columna = 'descripcion', activo = '' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        activo
      },
      headers: this.getToken
    })
  }

  nuevoTipo(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarTipo(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  abrirAbm(estado: 'crear' | 'editar', tipo: any = null): void {
    this.estadoAbm = estado;
    this.tipoSeleccionado = tipo;
    this.showModalAbm = true;
    if (estado === 'editar') {
      this.abmForm = { descripcion: tipo.descripcion }
    } else {
      this.abmForm = { descripcion: '' }
    }
  }

}
