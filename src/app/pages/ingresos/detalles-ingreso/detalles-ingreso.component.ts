import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { IngresosService } from '../../../services/ingresos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PastillaEstadoComponent } from '../../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { add, format } from 'date-fns';
import { ProductosService } from '../../../services/productos.service';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import { FiltroProductosPipe } from '../../../pipes/filtro-productos.pipe';
import { IngresosProductosService } from '../../../services/ingresos-productos.service';
import { AuthService } from '../../../services/auth.service';
import { FiltroIngresosProductosPipe } from '../../../pipes/filtro-ingresos-productos.pipe';
import gsap from 'gsap';
import { FiltroProveedoresPipe } from '../../../pipes/filtro-proveedores.pipe';
import { ProveedoresService } from '../../../services/proveedores.service';

@Component({
  standalone: true,
  selector: 'app-detalles-ingreso',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    MonedaPipe,
    FiltroProductosPipe,
    FiltroIngresosProductosPipe,
    FiltroProveedoresPipe
  ],
  templateUrl: './detalles-ingreso.component.html',
  styleUrls: []
})
export default class DetallesIngresoComponent implements OnInit {

  // Modals
  public showModalIngreso: boolean = false;
  public showModalProductos: boolean = false;
  public showModalProveedor = false;

  // Buscador - Proveedores
  public showBuscadorProveedores = false;
  public proveedores: any[] = [];
  public proveedorSeleccionado: any = null;

  // Ingreso
  public ingreso: any = null;

  // Productos
  public productos: any[] = [];
  public productoSeleccionado: any = null;
  public relacionSeleccionada: any = null;
  public productosCarrito: any[] = [];

  // Forms
  public estadoForm: string = 'crear';

  public productoForm: any = {
    actualizarPrecio: 'false',
    precioCompra: null,
    precioVenta: null,
    porcentajeGanancia: null,
    cantidad: null,
  }

  public proveedorForm = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    telefono: '',
    domicilio: '',
  }

  public filtros: any = {
    productos: '',
    productosCarrito: ''
  }

  public filtroProveedor = {
    parametro: ''
  }

  public ingresoForm: any = {
    fechaIngreso: format(new Date(), 'yyyy-MM-dd'),
    nroFactura: '',
    comentario: ''
  };

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private ingresosService: IngresosService,
    private productosService: ProductosService,
    private ingresosProductosService: IngresosProductosService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private proveedoresService: ProveedoresService,
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Detalles Ingreso';
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.alertService.loading();
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {
        this.ingresosService.getIngreso(id).subscribe({
          next: ({ ingreso }) => {
            this.ingreso = ingreso;
            this.productosCarrito = ingreso.ingresosProductos;
            this.ordenarProductosCarrito();
            this.reiniciarFormulario();
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  abrirModalIngreso(): void {
    this.proveedoresService.listarProveedores({
      direccion: 'asc',
      columna: 'descripcion',
      activo: 'true'
    }).subscribe({
      next: ({ proveedores }) => {
        this.proveedores = proveedores;
        this.showModalIngreso = true;
        this.reiniciarFormulario();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  abrirModalProductos(estado: string = 'crear', producto: any = null): void {

    this.estadoForm = estado;
    this.filtros.productos = '';

    if (this.estadoForm === 'crear') {
      this.alertService.loading();
      this.productoSeleccionado = null;
      this.productosService.listarProductos({ columna: 'descripcion', direccion: 'asc' }).subscribe({
        next: ({ productos }) => {
          this.productos = productos;
          this.showModalProductos = true;
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    } else { // -> Editar producto
      this.productoSeleccionado = producto.producto;
      this.relacionSeleccionada = producto;
      this.productoForm = {
        actualizarPrecio: producto.actualizarPrecio ? 'true' : 'false',
        precioCompra: producto.precioCompra || producto.precioCompra !== 0 ? producto.precioCompra : null,
        precioVenta: producto.precioVentaNuevo || producto.precioVentaNuevo !== 0 ? producto.precioVentaNuevo : null,
        porcentajeGanancia: producto.porcentajeGanancia || producto.porcentajeGanancia !== 0 ? producto.porcentajeGanancia : null,
        cantidad: producto.cantidad || producto.cantidad !== 0 ? producto.cantidad : null,
      }
      this.showModalProductos = true;
    }

  }

  agregarProducto(): void {

    // Verificacion - Si se actualiza el precio y no hay precio de venta
    if (this.productoForm.actualizarPrecio === 'true' && (!this.productoForm.precioVenta || this.productoForm <= 0)) return this.alertService.info('Debe ingresar un precio de venta');

    // Verificacion - Cantidad vacia
    if (!this.productoForm.cantidad) return this.alertService.info('Debe ingresar una cantidad');

    this.alertService.loading();

    const data = {
      ingresoId: this.ingreso.id,
      productoId: this.productoSeleccionado.id,
      precioCompra: this.productoForm.precioCompra ? this.productoForm.precioCompra : 0,
      actualizarPrecio: this.productoForm.actualizarPrecio === 'true' ? true : false,
      porcentajeGanancia: this.productoForm.actualizarPrecio === 'true' ? this.productoForm.porcentajeGanancia : 0,
      precioVentaAnterior: this.productoSeleccionado.precioVenta,
      precioVentaNuevo: this.productoForm.actualizarPrecio === 'true' ? this.productoForm.precioVenta : this.productoSeleccionado.precioVenta,
      cantidad: this.productoForm.cantidad,
      creatorUserId: this.authService.usuario.userId
    }

    this.ingresosProductosService.nuevoIngresoProducto(data).subscribe({
      next: ({ relacion }) => {
        this.productosCarrito.push(relacion);
        this.reiniciarFormularioProducto();
        this.ordenarProductosCarrito();
        this.productoSeleccionado = null;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  actualizarProducto(): void {

    // Verificacion - Si se actualiza el precio y no hay precio de venta
    if (this.productoForm.actualizarPrecio === 'true' && (!this.productoForm.precioVenta || this.productoForm <= 0)) return this.alertService.info('Debe ingresar un precio de venta');

    // Verificacion - Cantidad vacia
    if (!this.productoForm.cantidad) return this.alertService.info('Debe ingresar una cantidad');

    this.alertService.loading();

    const data = {
      precioCompra: this.productoForm.precioCompra ? this.productoForm.precioCompra : 0,
      actualizarPrecio: this.productoForm.actualizarPrecio === 'true' ? true : false,
      porcentajeGanancia: this.productoForm.actualizarPrecio === 'true' ? this.productoForm.porcentajeGanancia : 0,
      precioVentaAnterior: this.relacionSeleccionada.precioVentaAnterior,
      precioVentaNuevo: this.productoForm.actualizarPrecio === 'true' ? this.productoForm.precioVenta : this.relacionSeleccionada.precioVentaNuevo,
      cantidad: this.productoForm.cantidad,
      creatorUserId: this.authService.usuario.userId
    }

    this.ingresosProductosService.actualizarIngresoProducto(this.relacionSeleccionada.id, data).subscribe({
      next: ({ relacion }) => {
        this.productosCarrito = this.productosCarrito.map(producto => {
          if (producto.id === relacion.id) {
            producto.precioCompra = relacion.precioCompra;
            producto.actualizarPrecio = relacion.actualizarPrecio;
            producto.porcentajeGanancia = relacion.porcentajeGanancia;
            producto.precioVentaAnterior = relacion.precioVentaAnterior;
            producto.precioVentaNuevo = relacion.precioVentaNuevo;
            producto.cantidad = relacion.cantidad;
          }
          return producto;
        });
        this.reiniciarFormularioProducto();
        this.productoSeleccionado = null;
        this.showModalProductos = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  eliminarProducto(): void {
    this.alertService.question({ msg: 'Estas por eliminar un producto del ingreso', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ingresosProductosService.eliminarIngresoProducto(this.relacionSeleccionada.id).subscribe({
            next: () => {
              this.productosCarrito = this.productosCarrito.filter(producto => producto.id !== this.relacionSeleccionada.id);
              this.showModalProductos = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  actualizarIngreso(): void {
    this.alertService.loading();
    const data = {
      fechaIngreso: this.ingresoForm.fechaIngreso,
      nroFactura: this.ingresoForm.nroFactura,
      comentario: this.ingresoForm.comentario,
      proveedorId: this.proveedorSeleccionado.id,
    }
    this.ingresosService.actualizarIngreso(this.ingreso.id, data).subscribe({
      next: () => {
        // Reemplazar datos de ingreso
        this.ingreso.fechaIngreso = format(add(new Date(this.ingresoForm.fechaIngreso), { days: 2 }), 'yyyy-MM-dd');
        this.ingreso.nroFactura = this.ingresoForm.nroFactura;
        this.ingreso.comentario = this.ingresoForm.comentario.toUpperCase();
        this.ingreso.proveedor = this.proveedorSeleccionado;
        this.showModalIngreso = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  completarIngreso(): void {
    this.alertService.question({ msg: 'Estas por completar el ingreso', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ingresosService.completarIngreso(this.ingreso.id, {
            usuarioCompletadoId: this.authService.usuario.userId
          }).subscribe({
            next: () => {
              this.router.navigateByUrl('/dashboard/ingresos');
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });
  }

  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
    this.productoForm = {
      actualizarPrecio: 'false',
      precioCompra: null,
      precioVenta: producto.precioVenta,
      porcentajeGanancia: producto.porcentajeGanancia,
      cantidad: null
    }
    this.productoSeleccionado = producto;
  }

  deseleccionarProducto(): void {
    this.filtros.productos = '';
    this.productoSeleccionado = null;
    this.reiniciarFormularioProducto();
  }

  // Abrir nuevo proveedor
  abrirNuevoProveedor(): void {
    this.showModalIngreso = false;
    this.showModalProveedor = true;
    this.reiniciarFormularioProveedor();
  }

  // Cerrar nuevo proveedor
  cerrarNuevoProveedor(): void {
    this.showModalProveedor = false;
    this.showModalIngreso = true;
  }

  // Nuevo proveedor
  nuevoProveedor(): void {

    if (this.verificacionDatosProveedor() !== '') return this.alertService.info(this.verificacionDatosProveedor());

    this.alertService.loading();

    const data = {
      ...this.proveedorForm,
      creatorUserId: this.authService.usuario.userId
    }

    this.proveedoresService.nuevoProveedor(data).subscribe({
      next: ({ proveedor }) => {
        this.proveedorSeleccionado = proveedor;
        this.proveedores.push(proveedor);
        this.showModalProveedor = false;
        this.showModalIngreso = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Verificacion de datos
  verificacionDatosProveedor(): string {
    const { descripcion, identificacion } = this.proveedorForm;
    let msg = '';
    if (descripcion.trim() === '') msg = 'Debe colocar un Nombre o Razon Social';
    else if (identificacion.trim() === '') msg = 'Debe colocar una identificación';
    return msg;
  }


  submitForm(): void {
    if (this.estadoForm === 'crear') {
      this.agregarProducto();
    } else {
      this.actualizarProducto();
    }
  }

  seleccionarProveedor(proveedor: any): void {
    this.proveedorSeleccionado = proveedor;
    this.showBuscadorProveedores = false;
  }

  cancelarProveedor(): void {
    this.proveedorSeleccionado = null;
    this.filtroProveedor.parametro = '';
  }

  calcularPrecioVenta(): void {
    if (this.productoForm.precioCompra == null || this.productoForm.porcentajeGanancia == null) return;
    const precioCompra = Number(this.productoForm.precioCompra);
    const porcentajeGanancia = Number(this.productoForm.porcentajeGanancia);
    const precioVenta = precioCompra + (precioCompra * (porcentajeGanancia / 100));
    this.productoForm.precioVenta = Number(precioVenta.toFixed(2));
  }

  ordenarProductosCarrito(): void {
    this.productosCarrito = this.productosCarrito.sort((a, b) => {
      if (a.producto.descripcion > b.producto.descripcion) return 1;
      if (a.producto.descripcion < b.producto.descripcion) return -1;
      return 0;
    })
  }

  reiniciarFormulario(): void {
    const { fechaIngreso, nroFactura, comentario } = this.ingreso;
    this.ingresoForm = {
      fechaIngreso: format(fechaIngreso, 'yyyy-MM-dd'),
      nroFactura,
      comentario
    };
    this.proveedorSeleccionado = this.ingreso.proveedor;
  }

  reiniciarFormularioProducto(): void {
    this.productoForm = {
      actualizarPrecio: 'false',
      precioCompra: null,
      precioVenta: null,
      porcentajeGanancia: null,
      cantidad: null,
    }
  }

  // Reiniciando formulario proveedor
  reiniciarFormularioProveedor(): void {
    this.proveedorForm = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      telefono: '',
      domicilio: '',
    }
  }

}
