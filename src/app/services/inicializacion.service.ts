import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const baseUrl = environments.base_url;

@Injectable({
  providedIn: 'root'
})
export class InicializacionService {

  constructor(private http: HttpClient) { }

  // Inicializacion de sistema
  inicializarSistema(): Observable<any> {
    return this.http.get(`${baseUrl}/inicializacion`);
  }

}
