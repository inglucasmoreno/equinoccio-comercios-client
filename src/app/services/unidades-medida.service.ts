import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/unidades-medida';

@Injectable({
  providedIn: 'root'
})
export class UnidadesMedidaService {

  public estadoAbm: 'crear' | 'editar' = 'crear';
  public showModalAbm = false;
  public unidadesMedida: any[] = [];
  public unidadMedidaSeleccionada: any = null;
  public abmForm = { descripcion: '' };

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getUnidad(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarUnidades({
    direccion = 'desc',
    columna = 'descripcion',
    activo = ''
  }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        activo
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

  abrirAbm(estado: 'crear' | 'editar', unidad: any = null): void {
    this.estadoAbm = estado;
    this.unidadMedidaSeleccionada = unidad;
    this.showModalAbm = true;
    if(estado === 'editar'){
      this.abmForm = { descripcion: unidad.descripcion }
    }else{
      this.abmForm = { descripcion: '' }
    }
  }

}
