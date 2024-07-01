import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

const urlApi = environments.base_url + '/clientes';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  public showModalAbm = false;

  public estadoAbm: 'crear' | 'editar' = 'crear';
  public clientes: any[] = [];
  public clienteSeleccionado: any = null;
  public abmForm = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    telefono: '',
    domicilio: '',
  };

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getCliente(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  getIdentificacion(identificacion: string): Observable<any> {
    return this.http.get(`${urlApi}/identificacion/${identificacion}`, {
      headers: this.getToken
    })
  }

  listarClientes({ direccion = 'desc', columna = 'descripcion', parametro = '' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        parametro
      },
      headers: this.getToken
    })
  }

  nuevoCliente(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarCliente(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  abrirAbm(estado: 'crear' | 'editar', cliente: any = null, initData = null): void {
    this.estadoAbm = estado;
    this.clienteSeleccionado = cliente;
    this.showModalAbm = true;
    if (estado === 'editar') {
      this.abmForm = {
        descripcion: cliente.descripcion,
        tipo_identificacion: cliente.tipo_identificacion,
        identificacion: cliente.identificacion,
        telefono: cliente.telefono,
        domicilio: cliente.domicilio,
      }
    } else {
      this.abmForm = {
        descripcion: initData?.descripcion || '',
        tipo_identificacion: initData?.tipo_identificacion || 'DNI',
        identificacion: initData?.identificacion || '',
        telefono: initData?.telefono || '',
        domicilio: initData?.domicilio || '',
      }
    }
  }

}
