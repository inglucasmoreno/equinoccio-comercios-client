import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroProductosPipe } from '../../pipes/filtro-productos.pipe';
import { UnidadesMedidaService } from '../../services/unidades-medida.service';
import { MonedaPipe } from '../../pipes/moneda.pipe';
import AbmProductoComponent from './abm-producto/abm-producto.component';
import { PermisosDirective } from '../../directives/permisos.directive';

@Component({
  standalone: true,
  selector: 'app-productos',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    MonedaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroProductosPipe,
    AbmProductoComponent,
    PermisosDirective
  ],
  templateUrl: './productos.component.html',
  styleUrls: []
})
export default class ProductosComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['PRODUCTOS_ALL'];

  // Flags
  public alertaStock = false;
  public showAlertaStock = false;

  // Productos
  public productosTMP: any[] = [];

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(
    public productosService: ProductosService,
    private alertService: AlertService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Productos';
    this.alertService.loading();
    this.listarProductos();
  }

  // Listar productos
  listarProductos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.productosService.listarProductos(parametros).subscribe({
      next: ({ productos }) => {
        this.productosService.productos = productos;
        this.productosTMP = productos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  nuevoProducto(producto): void {
    this.productosService.productos = [producto, ...this.productosService.productos];
    this.alertService.close();
  }

  actualizarProducto(producto): void {
    const index = this.productosService.productos.findIndex((t: any) => t.id === producto.id);
    this.productosService.productos[index] = producto;
    this.productosService.productos = [...this.productosService.productos];
    this.alertService.close();
  }

  // Actualizar estado Activo/Inactivo

  actualizarEstado(producto: any): void {

    const { id, activo } = producto;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.productosService.actualizarProducto(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarProductos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Filtrar por alerta de stock
  filtrarAlertaStock(): void {
    this.showAlertaStock = !this.showAlertaStock;
    if (this.showAlertaStock)
      this.productosService.productos = this.productosService.productos.filter((producto: any) => producto.alertaStock && producto.cantidad < producto.cantidadMinima);
    else
      this.productosService.productos = this.productosTMP;
  }

  // Ordenar productos por descripcion
  ordenarProductos(): void {
    this.ordenarPorColumna('descripcion');
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 'asc' ? 'desc' : 'asc';
    this.alertService.loading();
    this.listarProductos();
  }

}
