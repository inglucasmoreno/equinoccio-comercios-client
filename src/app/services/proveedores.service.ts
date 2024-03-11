import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/proveedores';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  public estadoAbm: 'crear' | 'editar' = 'crear';
  public showModalAbm = false;
  public proveedores: any[] = [];
  public proveedorSeleccionado: any = null;
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

  getProveedor(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarProveedores({ direccion = 'desc', columna = 'descripcion', activo = '' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna,
        activo
      },
      headers: this.getToken
    })
  }

  nuevoProveedor(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarProveedor(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  abrirAbm(estado: 'crear' | 'editar', proveedor: any = null): void {
    this.estadoAbm = estado;
    this.proveedorSeleccionado = proveedor;
    this.showModalAbm = true;
    if (estado === 'editar') {
      this.abmForm = {
        descripcion: proveedor.descripcion,
        tipo_identificacion: proveedor.tipo_identificacion,
        identificacion: proveedor.identificacion,
        telefono: proveedor.telefono,
        domicilio: proveedor.domicilio,
      }
    } else {
      this.abmForm = {
        descripcion: '',
        tipo_identificacion: 'DNI',
        identificacion: '',
        telefono: '',
        domicilio: '',
      }
    }
  }

}
