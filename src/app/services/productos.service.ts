import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environments/environments';

const urlApi = environments.base_url + '/productos';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  public showModalAbm = false;
  public showModalAgregarProducto = false;

  public estadoAbm: 'crear' | 'editar' = 'crear';
  public productos: any[] = [];
  public productoSeleccionado: any = null;
  public abmForm = {
    codigo: '',
    descripcion: '',
    cantidad: 0,
    alertaStock: "false",
    cantidadMinima: null,
    precioCompra: null,
    precioVenta: null,
    porcentajeGanancia: null,
    balanza: "false",
    alicuota: "21",
    unidadMedidaId: "1",
  };

  get getToken(): any {
    return { 'Authorization': localStorage.getItem('token') }
  }

  constructor(private http: HttpClient) { }

  getProducto(id: string): Observable<any> {
    return this.http.get(`${urlApi}/${id}`, {
      headers: this.getToken
    })
  }

  getProductoPorCodigo(codigo: string): Observable<any> {
    return this.http.get(`${urlApi}/buscar/codigo/${codigo}`, {
      headers: this.getToken
    })
  }

  generarCodigo(): Observable<any> {
    return this.http.get(`${urlApi}/generar/codigo`, {
      headers: this.getToken
    })
  }

  listarProductos({ direccion = 'asc', columna = 'descripcion' }): Observable<any> {
    return this.http.get(urlApi, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: this.getToken
    })
  }

  nuevoProducto(data: any): Observable<any> {
    return this.http.post(urlApi, data, {
      headers: this.getToken
    })
  }

  actualizarProducto(id: string, data: any): Observable<any> {
    return this.http.patch(`${urlApi}/${id}`, data, {
      headers: this.getToken
    })
  }

  abrirAbm(estado: 'crear' | 'editar', producto: any = null): void {
    this.estadoAbm = estado;
    this.productoSeleccionado = producto;
    this.showModalAbm = true;
    if (estado === 'editar') {
      this.abmForm = {
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        cantidad: producto.cantidad,
        alertaStock: producto.alertaStock.toString(),
        cantidadMinima: producto.cantidadMinima,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precioVenta,
        porcentajeGanancia: producto.porcentajeGanancia,
        balanza: producto.balanza.toString(),
        alicuota: producto.alicuota.toString(),
        unidadMedidaId: producto.unidadMedidaId,
      }
    } else {
      this.abmForm = {
        codigo: '',
        descripcion: '',
        cantidad: 0,
        alertaStock: "false",
        cantidadMinima: null,
        precioCompra: null,
        precioVenta: null,
        porcentajeGanancia: null,
        balanza: "false",
        alicuota: "21",
        unidadMedidaId: "1",
      }
    }
  }

  abrirAgregarProducto(): void {

  }

}
