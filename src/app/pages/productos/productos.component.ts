import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroProductosPipe } from '../../pipes/filtro-productos.pipe';

@Component({
  standalone: true,
  selector: 'app-productos',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroProductosPipe
  ],
  templateUrl: './productos.component.html',
  styleUrls: []
})
export default class ProductosComponent implements OnInit {

  // Modal
  public showModalProducto = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Productos
  public idProducto: string = '';
  public productos: any = [];
  public productoSeleccionado: any;
  public descripcion: string = '';

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

  // Formulario de producto
  public productoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Productos';
    this.alertService.loading();

    // Inicializacion de formulario
    this.productoForm = this.fb.group({
      codigo: ['', [Validators.required]],
      descripcion: ['', Validators.required],
      cantidad: [0, Validators.required],
      alertaStock: [false, Validators.required],
      precioCompra: [0, Validators.required],
      precioVenta: [0, [Validators.required]],
      porcentajeGanancia: [5, [Validators.required]],
      balanza: [false, [Validators.required]],
      alicuota: [21, [Validators.required]],
      marcaId: ['', [Validators.required]],
      unidadMedidaId: ['', [Validators.required]],
    });

    this.listarProductos();
  }

  // Abrir modal
  abrirModal(estado: string, producto: any = null): void {
    this.reiniciarFormulario();
    this.productoForm.reset();
    this.idProducto = '';

    if (estado === 'editar') this.getProducto(producto);
    else this.showModalProducto = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de producto
  getProducto(producto: any): void {
    this.alertService.loading();
    this.idProducto = producto.id;
    this.productoSeleccionado = producto;
    this.productosService.getProducto(producto.id).subscribe({
      next: ({ producto }) => {
        this.productoForm = this.fb.group({
          codigo: [producto.codigo, [Validators.required]],
          descripcion: [producto.descripcion, Validators.required],
          cantidad: [producto.cantidad, Validators.required],
          precioCompra: [producto.precioCompra, Validators.required],
          precioVenta: [producto.precioVenta, [Validators.required]],
          porcentajeGanancia: [producto.porcentajeGanancia, [Validators.required]],
          balanza: [producto.balanza, [Validators.required]],
          alicuota: [producto.alicuota, [Validators.required]],
          marcaId: [producto.marcaId, [Validators.required]],
          unidadMedidaId: [producto.unidadMedidaId, [Validators.required]],
        });
        this.alertService.close();
        this.showModalProducto = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar productos
  listarProductos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.productosService.listarProductos(parametros).subscribe({
      next: ({ productos }) => {
        this.productos = productos;
        this.showModalProducto = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo producto
  nuevoProducto(): void {

    // this.alertService.loading();

    const data = {
      ...this.productoForm.value,
      creatorUserId: this.authService.usuario.userId,
    }

    console.log(data);

    // this.productosService.nuevoProducto(data).subscribe({
    //   next: () => {
    //     this.alertService.loading();
    //     this.listarProductos();
    //   }, error: ({ error }) => this.alertService.errorApi(error.message)
    // })

  }

  // Actualizar producto
  actualizarProducto(): void {

    // this.alertService.loading();

    const data = {
      ...this.productoForm.value,
    }

    console.log(data);

    // this.productosService.actualizarProducto(this.idProducto, data).subscribe({
    //   next: () => {
    //     this.alertService.loading();
    //     this.listarProductos();
    //   }, error: ({ error }) => this.alertService.errorApi(error.message)
    // });

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

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.productoForm.reset();
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
