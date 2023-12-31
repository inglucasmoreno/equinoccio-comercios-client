import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const urlApi = environments.base_url + '/usuarios';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getUsuario(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    }).pipe(
      map((resp: any) => resp.usuario)
    )
  }

  listarUsuarios(direccion: number = 1, columna: string = 'apellido'): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: this.getToken
    })
  }

  nuevoUsuario(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarUsuario(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  actualizarPasswordPefil(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/password/${id}`, data, {
      headers: this.getToken
    })
  }

}
