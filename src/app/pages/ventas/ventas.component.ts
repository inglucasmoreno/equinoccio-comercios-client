import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ProductosService } from '../../services/productos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { MonedaPipe } from '../../pipes/moneda.pipe';
import { FiltroProductosPipe } from '../../pipes/filtro-productos.pipe';
import { formasPagoArray } from '../../constants/formasPagoArray';
import { formasPagoArrayMulti } from '../../constants/formasPagoArrayMulti';
import { generales } from '../../constants/generales';
import { VentasService } from '../../services/ventas.service';
import gsap from 'gsap';

interface ProductoMuestra {
  descripcion: string;
  precioTotal: number;
  precioUnitario: number;
  cantidad: number;
  unidadMedida: string;
}

interface FormaPago {
  valor: number;
  descripcion: string;
  nroComprobante?: string;
  creatorUserId: number;
}

type EstadoVenta = 'Codigo' | 'Precio' | 'Cantidad';

@Component({
  standalone: true,
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
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
    FiltroProductosPipe
  ],
  styleUrls: []
})
export default class VentasComponent implements OnInit {

  // Fecha
  public fechaActual: Date = new Date();

  // Flags
  public estadoVenta: string = 'Codigo';
  public showModalCompletar: boolean = false;
  public imprimirTicket: boolean = true;

  // Busqueda
  public codigo: string = "";
  public ultimoProductoCargado: ProductoMuestra = null;

  // Producto
  public productoSeleccionado: any = null;
  public productos: any[] = [];
  public carritoProductos: any[] = [];
  public cantidad: number = null;
  public precio: number = null;

  // Venta
  public comprobante: string = 'Normal';
  public totalBalanza: number = 0;
  public totalNoBalanza: number = 0;
  public pedidosYaComprobante: string = '';
  public adicionalCredito: number = 0;
  public valorFormaPago: number = null;
  public formaPago: string = 'Efectivo';
  public porcentajePorCredito: number = generales.porcentajePorCredito;
  public precioTotalVenta: number = 0;
  public precioTotalLimpio: number = 0;
  public vuelto: number = null;
  public pagaCon: number = null;

  // Multiples formas de pago
  public totalPagado = 0;
  public faltaPagar = 0;
  public multiplesFormasPago: boolean = false;
  public formasPago: FormaPago[] = [];

  // Busqueda
  public filtro: any = {
    productos: ''
  }

  // Arreglo - Formas de pago
  public formasPagoArray: any[] = formasPagoArray

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private productosService: ProductosService,
    private alertService: AlertService,
    private ventasService: VentasService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Generando venta';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.recuperarDeLocalStorage();
  }

  productoPorCodigo() {

    if (this.codigo?.trim() === '') {
      this.alertService.info('Debe colocar un codigo de producto');
      return;
    }

    this.alertService.loading();
    this.productosService.getProductoPorCodigo(this.codigo).subscribe({
      next: ({ producto }) => {
        this.codigo = '';
        this.agregarProductoCarrito(producto, 1);
        this.alertService.close();
      }, error: ({ error }) => {
        this.codigo = '';
        this.alertService.errorApi(error.message);
      }
    })

  }

  seleccionarProducto(producto: any): void {
    this.filtro.productos = '';
    this.productoSeleccionado = producto;
    this.almacenarEnLocalStorage();
  }

  agregarProductoCarrito(producto: any, cantidad: number): void {

    const precioTotal = producto.precioVenta * cantidad;

    // Ultimo producto cargado
    this.ultimoProductoCargado = {
      descripcion: producto.descripcion,
      precioUnitario: producto.precioVenta,
      precioTotal,
      cantidad,
      unidadMedida: producto.unidadMedida.descripcion
    };

    // Si el producto ya esta en el carrto le sumo 1 a la cantidad sin usar index
    const productoEnCarrito = this.carritoProductos.find((productoCarrito: any) => productoCarrito.producto.id == producto.id);

    if (productoEnCarrito) {
      productoEnCarrito.cantidad += cantidad;
      productoEnCarrito.precioTotal += precioTotal;
      this.productoSeleccionado = null;
      this.cantidad = null;
      this.calcularPrecioFinal();
      return;
    } else {
      const dataProducto = {
        producto,
        cantidad,
        precioUnitario: producto.precioVenta,
        precioTotal: precioTotal,
        creatorUserId: this.authService.usuario.userId
      }
      this.carritoProductos.unshift(dataProducto);
      this.productoSeleccionado = null;
      this.cantidad = null;
      this.calcularPrecioFinal();
    }

  }

  agregarFormaPago(): void {

    if (this.valorFormaPago <= 0) {
      this.alertService.info('Debe colocar un monto valido');
      return;
    }

    const formaPagoRepetida = this.formasPago.find((formaPago: any) => formaPago.descripcion == this.formaPago);
    if (formaPagoRepetida) return this.alertService.info('La forma de pago ya esta agregada');

    // Se incrementa el total pagado
    this.totalPagado += this.valorFormaPago;

    if (this.totalPagado > this.precioTotalVenta) {
      this.alertService.info('El total pagado no puede ser mayor al precio final');
      this.totalPagado -= this.valorFormaPago;
      return;
    }

    this.formasPago.unshift({
      valor: this.valorFormaPago,
      descripcion: this.formaPago,
      creatorUserId: this.authService.usuario.userId
    });

    this.calcularPrecioFinal();
    this.calcularFaltaPagar();

  }

  eliminarProductoCarrito(id: string): void {
    this.alertService.question({ msg: '¿Quieres quitar el producto?', buttonText: 'Quitar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.carritoProductos = this.carritoProductos.filter((producto: any) => producto.producto.id != id);
          this.carritoProductos.length === 0 ? this.ultimoProductoCargado = null : null;
          this.calcularPrecioFinal();
        }
      });
  }

  eliminarFormaPago(descripcion: string): void {
    this.formasPago = this.formasPago.filter((formaPago: any) => formaPago.descripcion != descripcion);
    this.totalPagado = 0;
    this.formasPago.forEach((formaPago: any) => {
      this.totalPagado += formaPago.valor;
    });
    this.calcularFaltaPagar();
  }

  cancelarVenta(): void {
    this.alertService.question({ msg: '¿Quieres reiniciar la venta?', buttonText: 'Reiniciar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.reiniciarVenta();
        }
      });
  }

  cancelarProductoSeleccionado(): void {
    this.productoSeleccionado = null;
    this.filtro.productos = '';
    this.almacenarEnLocalStorage();
  }

  abrirCompletarVenta(): void {
    this.showModalCompletar = true;
  }

  cambiarEstadoVenta(estado: EstadoVenta): void {

    this.estadoVenta = estado;
    this.codigo = '';
    this.filtro.productos = '';
    this.productoSeleccionado = null;

    if (estado !== 'Codigo') {
      this.alertService.loading();
      this.productosService.listarProductos({}).subscribe({
        next: ({ productos }) => {
          this.productos = productos;
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }

    this.almacenarEnLocalStorage();

  }

  cambiarImprimirTicket(): void {
    this.imprimirTicket = !this.imprimirTicket;
    this.almacenarEnLocalStorage();
  }

  cambiarFormaPago(): void {
    if (!this.multiplesFormasPago) this.calcularPrecioFinal();
  }

  cambiarMultiplesFormasPago(): void {

    this.formaPago = 'Efectivo';
    this.multiplesFormasPago = !this.multiplesFormasPago;

    if (this.multiplesFormasPago) this.formasPagoArray = formasPagoArrayMulti;
    else this.formasPagoArray = formasPagoArray;

    this.valorFormaPago = this.precioTotalLimpio;
    this.precioTotalVenta = this.precioTotalLimpio;
    this.faltaPagar = this.precioTotalVenta;
    this.totalPagado = 0;
    this.formasPago = [];

    this.almacenarEnLocalStorage();

  }

  calcularFaltaPagar(): void {
    this.faltaPagar = this.precioTotalVenta - this.totalPagado;
    this.faltaPagar = Math.round(this.faltaPagar * 100) / 100;  // Se redondea a dos decimales
    this.valorFormaPago = this.faltaPagar;
    this.almacenarEnLocalStorage();
  }

  calcularVuelto(): void {
    this.vuelto = this.pagaCon - this.precioTotalVenta;
    if (this.vuelto < 0) this.vuelto = null;
  }

  calcularPrecioFinal(): void {

    let totalBalanza = 0;
    let totalNoBalanza = 0;
    let precioTotalVenta = 0;
    let precioTotalLimpio = 0;
    this.adicionalCredito = 0;

    this.carritoProductos.forEach((producto: any) => {
      totalBalanza += producto.producto.balanza ? producto.precioTotal : 0;
      totalNoBalanza += !producto.producto.balanza ? producto.precioTotal : 0;
      precioTotalVenta += producto.precioTotal;
      precioTotalLimpio += producto.precioTotal;
    });

    this.precioTotalVenta = precioTotalVenta;
    this.precioTotalLimpio = precioTotalLimpio;
    this.totalBalanza = totalBalanza;
    this.totalNoBalanza = totalNoBalanza;

    // Se agrega adicional por credito - En pago unico
    if (this.formaPago === 'Credito' && !this.multiplesFormasPago) {
      this.adicionalCredito = this.precioTotalVenta * (this.porcentajePorCredito / 100);
      this.precioTotalVenta += this.adicionalCredito;
    }

    // Se redondean los totales a dos decimales
    this.precioTotalVenta = Math.round(this.precioTotalVenta * 100) / 100;
    this.precioTotalLimpio = Math.round(this.precioTotalLimpio * 100) / 100;
    this.totalBalanza = Math.round(this.totalBalanza * 100) / 100;
    this.totalNoBalanza = Math.round(this.totalNoBalanza * 100) / 100;
    this.adicionalCredito = Math.round(this.adicionalCredito * 100) / 100;

    this.almacenarEnLocalStorage();

  }

  completarVenta(): void {

    // Cuando multiplesFormasPago es true, se verifica que el total pagado sea igual al precio final
    if (this.multiplesFormasPago && (this.precioTotalVenta - this.totalPagado > 0.1)) {
      this.alertService.info('El total pagado debe ser igual al precio final');
      return;
    }

    // Constantes
    const condicionPedidosYa = (this.formaPago === 'PedidosYa - Efectivo' || this.formaPago === 'PedidosYa - Online') && !this.multiplesFormasPago;

    // Datos de venta

    const venta: any = {
      comprobante: this.comprobante,
      precioTotal: this.precioTotalVenta,
      totalBalanza: this.totalBalanza,
      totalNoBalanza: this.totalNoBalanza,
      precioTotalLimpio: this.precioTotalLimpio,
      adicionalCredito: this.adicionalCredito,
      creatorUserId: this.authService.usuario.userId
    }

    // Datos de productos
    let productos: any[] = [];
    this.carritoProductos.map((producto: any) => {
      productos.push({
        productoId: producto.producto.id,
        cantidad: producto.cantidad,
        precioUnitario: producto.precioUnitario,
        precioTotal: producto.precioTotal,
        creatorUserId: this.authService.usuario.userId
      });
    });

    // Datos de formas de pago

    let formasPago: FormaPago[] = []

    if (this.multiplesFormasPago) {     // Multiples formas de pago
      formasPago = this.formasPago;
    } else {                            // Forma de pago unica
      formasPago = [{
        valor: this.precioTotalVenta,
        descripcion: this.formaPago,
        nroComprobante: condicionPedidosYa ? this.pedidosYaComprobante : '',
        creatorUserId: this.authService.usuario.userId
      }]
    }

    // Datos de facturacion

    const facturacion = {
      puntoVenta: 0,
      tipoComprobante: 0,
      nroComprobante: 0,
    }

    const data = {
      dataVenta: venta,
      dataFacturacion: facturacion,
      dataFormasPago: formasPago,
      dataProductos: productos,
      dataOtros: {
        imprimirTicket: this.imprimirTicket
      }
    }

    this.alertService.question({ msg: '¿Quieres completar la venta?', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasService.nuevaVenta(data).subscribe({
            next: () => {
              this.reiniciarVenta();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });

  }

  reiniciarVenta(): void {
    this.codigo = '';
    this.precioTotalVenta = 0;
    this.precioTotalLimpio = 0;
    this.ultimoProductoCargado = null;
    this.comprobante = 'Normal';
    this.totalBalanza = 0;
    this.totalNoBalanza = 0;
    this.adicionalCredito = 0;
    this.valorFormaPago = null;
    this.formaPago = 'Efectivo';
    this.porcentajePorCredito = generales.porcentajePorCredito;
    this.vuelto = null;
    this.pagaCon = null;
    this.estadoVenta = 'Codigo';
    this.showModalCompletar = false;
    this.productoSeleccionado = null;
    this.productos = [];
    this.carritoProductos = [];
    this.cantidad = null;
    this.precio = null;
    this.totalPagado = 0;
    this.faltaPagar = 0;
    this.multiplesFormasPago = false;
    this.formasPago = [];
    this.formasPagoArray = formasPagoArray
    this.filtro = { productos: '' }
    this.almacenarEnLocalStorage();
  }

  almacenarEnLocalStorage(): void {

    // Almacenar valores en localstorage si existen sino null
    
    this.carritoProductos ? localStorage.setItem('venta-carritoProductos', JSON.stringify(this.carritoProductos)) : null;
    this.comprobante ? localStorage.setItem('venta-comprobante', this.comprobante) : null;
    this.totalBalanza ? localStorage.setItem('venta-totalBalanza', this.totalBalanza.toString()) : null;
    this.totalNoBalanza ? localStorage.setItem('venta-totalNoBalanza', this.totalNoBalanza.toString()) : null;
    this.adicionalCredito ? localStorage.setItem('venta-adicionalCredito', this.adicionalCredito.toString()) : null;
    this.valorFormaPago ? localStorage.setItem('venta-valorFormaPago', this.valorFormaPago.toString()) : null;
    this.formaPago ? localStorage.setItem('venta-formaPago', this.formaPago) : null;
    this.porcentajePorCredito ? localStorage.setItem('venta-porcentajePorCredito', this.porcentajePorCredito.toString()) : null;
    this.precioTotalVenta ? localStorage.setItem('venta-precioTotalVenta', this.precioTotalVenta.toString()) : null;
    this.precioTotalLimpio ? localStorage.setItem('venta-precioTotalLimpio', this.precioTotalLimpio.toString()) : null;
    localStorage.setItem('venta-imprimirTicket', this.imprimirTicket.toString());
    this.productos ? localStorage.setItem('venta-productos', JSON.stringify(this.productos)) : null;
    this.totalPagado ? localStorage.setItem('venta-totalPagado', this.totalPagado.toString()) : null;
    localStorage.setItem('venta-faltaPagar', this.faltaPagar.toString());
    localStorage.setItem('venta-multiplesFormasPago', this.multiplesFormasPago.toString());
    this.formasPago ? localStorage.setItem('venta-formasPago', JSON.stringify(this.formasPago)) : null;
    this.formasPagoArray ? localStorage.setItem('venta-formasPagoArray', JSON.stringify(this.formasPagoArray)) : null;
    this.valorFormaPago !== null ? localStorage.setItem('venta-valorFormaPago', this.valorFormaPago.toString()) : null;
  }

  recuperarDeLocalStorage(): void {
    // Recuperar valores de localstorage si no tiene nada colocar el valor incial
    this.carritoProductos = JSON.parse(localStorage.getItem('venta-carritoProductos')) || [];
    this.comprobante = localStorage.getItem('venta-comprobante') || 'Normal';
    this.totalBalanza = parseFloat(localStorage.getItem('venta-totalBalanza')) || 0;
    this.totalNoBalanza = parseFloat(localStorage.getItem('venta-totalNoBalanza')) || 0;
    this.adicionalCredito = parseFloat(localStorage.getItem('venta-adicionalCredito')) || 0;
    this.valorFormaPago = parseFloat(localStorage.getItem('venta-valorFormaPago')) || null;
    this.formaPago = localStorage.getItem('venta-formaPago') || 'Efectivo';
    this.porcentajePorCredito = parseFloat(localStorage.getItem('venta-porcentajePorCredito')) || generales.porcentajePorCredito;
    this.precioTotalVenta = parseFloat(localStorage.getItem('venta-precioTotalVenta')) || 0;
    this.precioTotalLimpio = parseFloat(localStorage.getItem('venta-precioTotalLimpio')) || 0;
    this.imprimirTicket = localStorage.getItem('venta-imprimirTicket') === 'true' ? true : false;
    this.productos = JSON.parse(localStorage.getItem('venta-productos')) || [];
    this.totalPagado = parseFloat(localStorage.getItem('venta-totalPagado')) || 0;
    this.faltaPagar = parseFloat(localStorage.getItem('venta-faltaPagar')) || 0;
    this.multiplesFormasPago = localStorage.getItem('venta-multiplesFormasPago') === 'true' ? true : false;
    this.formasPago = JSON.parse(localStorage.getItem('venta-formasPago')) || [];
    this.formasPagoArray = JSON.parse(localStorage.getItem('venta-formasPagoArray')) || formasPagoArray;
    this.valorFormaPago = parseFloat(localStorage.getItem('venta-valorFormaPago')) || null;
  }

}