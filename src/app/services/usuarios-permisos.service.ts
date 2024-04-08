import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const urlApi = environments.base_url + '/usuarios-permisos';

@Injectable({
  providedIn: 'root'
})
export class UsuariosPermisosService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getPermiso(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  listarPermisos({ direccion = 'desc', columna = 'createdAt' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: this.getToken
    })
  }

  nuevoPermiso(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarPermiso(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

}
