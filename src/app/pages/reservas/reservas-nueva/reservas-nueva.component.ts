import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import { ClientesService } from '../../../services/clientes.service';
import { add, format } from 'date-fns';
import { ProductosService } from '../../../services/productos.service';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import gsap from 'gsap';
import { FiltroProductosPipe } from '../../../pipes/filtro-productos.pipe';
import { AbmClienteComponent } from '../../clientes/abm-cliente/abm-cliente.component';
import { AgregarProductoComponent } from '../../productos/agregar-producto/agregar-producto.component';
import { generales } from '../../../constants/generales';
import { formasPagoArray } from '../../../constants/formasPagoArray';
import { formasPagoArrayMulti } from '../../../constants/formasPagoArrayMulti';
import { AuthService } from '../../../services/auth.service';
import { VentasService } from '../../../services/ventas.service';
import { ReservasService } from '../../../services/reservas.service';
import { VentasReservasService } from '../../../services/ventas-reservas.service';

interface FormaPago {
  valor: number;
  descripcion: string;
  nroComprobante?: string;
  creatorUserId: number;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    MonedaPipe,
    FiltroProductosPipe,
    AbmClienteComponent,
    AgregarProductoComponent
  ],
  selector: 'app-reservas-nueva',
  templateUrl: './reservas-nueva.component.html',
  styleUrls: []
})
export default class ReservasNuevaComponent implements OnInit {

  // Fecha
  public fechaActual: Date = new Date();

  // Flags
  public showModalCompletar: boolean = false;
  public showModalGenerarReserva: boolean = false;

  // Carrito
  public carritoProductos: any[] = [];

  // Multiples formas de pago
  public totalPagado = 0;
  public faltaPagar = 0;
  public multiplesFormasPago: boolean = false;
  public formasPago: FormaPago[] = [];

  // Reserva
  public dataReserva = {
    fechaReserva: format(new Date(), 'yyyy-MM-dd'),
    fechaEntrega: '',
    horaEntrega: '',
    usuarioCreador: '',
    fechaFinalizacion: '',
    observaciones: '',
    precioTotal: 0,
    adelanto: null,
    horasAntes: '3',
    fechaAlerta: '',
    tipoObservacion: 'General',
    tortaRelleno1: '',
    tortaRelleno2: '',
    tortaRelleno3: '',
    tortaForma: '',
    tortaPeso: null,
    tortaCobertura: '',
    tortaDetalles: ''
  };

  // Venta
  public comprobante: string = 'Normal';
  public imprimirTicket: boolean = true;
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

  public formasPagoArray: any[] = formasPagoArray;

  // Clientes
  public clienteSeleccionado: any = null;
  public identificacionCliente: string = '';

  // Filtro
  filtroProductos: any = {
    parametro: '',
  }

  constructor(
    private alertService: AlertService,
    private productosService: ProductosService,
    private dataService: DataService,
    private clientesService: ClientesService,
    private authService: AuthService,
    private ventasService: VentasService,
    private reservasService: ReservasService,
    private ventasReservasService: VentasReservasService,
    private router: Router
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Nueva reserva';
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
  }

  // TODO: Reserva

  abrirCompletarReserva(): void {

    const {
      tipoObservacion,
      tortaRelleno1,
      tortaForma,
      tortaPeso,
      tortaCobertura
    } = this.dataReserva;

    // Verificacion: Observaciones de torta
    if (tipoObservacion === 'Torta' && tortaRelleno1.trim() === '') return this.alertService.info('Debe colocar el primer relleno de la torta');
    if (tipoObservacion === 'Torta' && tortaForma.trim() === '') return this.alertService.info('Debe colocar la forma de la torta');
    if (tipoObservacion === 'Torta' && !tortaPeso) return this.alertService.info('Debe colocar el peso de la torta');
    if (tipoObservacion === 'Torta' && tortaCobertura.trim() === '') return this.alertService.info('Debe colocar la cobertura de la torta');

    this.showModalGenerarReserva = true;
    this.dataReserva.adelanto = this.dataReserva.precioTotal / 2;
    this.calcularFaltaPagarReserva();
  }

  regresarReserva(): void {
    this.showModalCompletar = false;
    this.showModalGenerarReserva = true;
  }

  calcularFaltaPagarReserva(): void {
    this.faltaPagar = this.dataReserva.precioTotal - this.dataReserva.adelanto;
  }

  // TODO: Clientes

  abrirAbmCliente(): void {
    this.clientesService.abrirAbm('crear');
  }

  buscarCliente(): void {
    if (this.identificacionCliente.trim() === '') return this.alertService.info('Ingrese una identificación');
    this.alertService.loading();
    this.clientesService.getIdentificacion(this.identificacionCliente).subscribe({
      next: ({ cliente }) => {
        if (cliente) this.seleccionarCliente(cliente)
        else this.abrirAbmCliente();
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.identificacionCliente = '';
    this.alertService.close();
  }

  deseleccionarCliente(): void {
    this.clienteSeleccionado = null;
  }

  // TODO: Productos

  abrirModalAgregarProducto(): void {
    this.productosService.showModalAgregarProducto = true;
  }

  agregarProducto(producto): void {

    // Se verifica si el producto esta cargado
    const productoCargado = this.carritoProductos.find(elemento => elemento.producto.id === producto.producto.id);
    if (productoCargado) return this.alertService.info('El producto ya se encuentra cargado');

    const productoCarrito = {
      producto: producto.producto,
      cantidad: producto.cantidad,
      precioTotal: producto.precioTotal,
      precioUnitario: producto.producto.precioVenta,
    }
    this.carritoProductos = [...this.carritoProductos, productoCarrito];
    this.calcularPrecioTotal();

  }

  eliminarProducto(producto): void {
    this.carritoProductos = this.carritoProductos.filter(elemento => elemento.producto.id !== producto.producto.id);
    this.calcularPrecioTotal();
  }

  calcularPrecioTotal(): void {
    this.dataReserva.precioTotal = 0;
    this.carritoProductos.forEach(producto => this.dataReserva.precioTotal += producto.precioTotal);
  }

  // TODO: Venta

  abrirCompletarVenta(): void {

    // Verificacion - Datos de venta
    if (!this.dataReserva.fechaEntrega) {
      this.alertService.info('Debe colocar una fecha de entrega');
      return;
    }

    if (!this.dataReserva.horaEntrega) {
      this.alertService.info('Debe colocar una hora de entrega');
      return;
    }

    if (!this.dataReserva.usuarioCreador) {
      this.alertService.info('Debe colocar el nombre de quien genera el reserva');
      return;
    }

    if (!this.dataReserva.adelanto) {
      this.alertService.info('Debe colocar el valor de la seña');
      return;
    }

    this.showModalCompletar = true;
    this.precioTotalLimpio = this.dataReserva.adelanto;
    this.precioTotalVenta = this.dataReserva.adelanto;
    this.showModalGenerarReserva = false;
    this.calcularPrecioFinal();

  }

  cambiarFormaPago(): void {
    if (!this.multiplesFormasPago) this.calcularPrecioFinal();
  }

  cambiarImprimirTicket(): void {
    this.imprimirTicket = !this.imprimirTicket;
    // this.almacenarEnLocalStorage();
  }

  calcularVuelto(): void {
    this.vuelto = this.pagaCon - this.precioTotalVenta;
    if (this.vuelto < 0) this.vuelto = null;
  }

  calcularPrecioFinal(): void {

    this.precioTotalVenta = this.dataReserva.adelanto;
    this.precioTotalLimpio = this.dataReserva.adelanto;
    this.totalBalanza = 0;
    this.totalNoBalanza = 0;
    this.adicionalCredito = 0;

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

    // this.almacenarEnLocalStorage();

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

    // this.almacenarEnLocalStorage();

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

  calcularFaltaPagar(): void {
    this.faltaPagar = this.precioTotalVenta - this.totalPagado;
    this.faltaPagar = Math.round(this.faltaPagar * 100) / 100;  // Se redondea a dos decimales
    this.valorFormaPago = this.faltaPagar;
    // this.almacenarEnLocalStorage();
  }

  eliminarFormaPago(descripcion: string): void {
    this.formasPago = this.formasPago.filter((formaPago: any) => formaPago.descripcion != descripcion);
    this.totalPagado = 0;
    this.formasPago.forEach((formaPago: any) => {
      this.totalPagado += formaPago.valor;
    });
    this.calcularFaltaPagar();
  }

  completarVenta(): void {

    // Si la forma de pago es pedidosYa y el nroComprobante esta vacio se debe colocar el nroComprobante
    if ((this.formaPago === 'PedidosYa - Efectivo' || this.formaPago === 'PedidosYa - Online') && !this.multiplesFormasPago) {
      if (this.pedidosYaComprobante === '') {
        this.alertService.info('Debe colocar el nro de comprobante');
        return;
      }
    }

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
      totalAdelantoReserva: this.precioTotalVenta,
      totalCompletarReserva: 0,
      totalBalanza: 0,
      totalNoBalanza: 0,
      precioTotalLimpio: this.precioTotalLimpio,
      adicionalCredito: !this.multiplesFormasPago && this.formaPago === 'Credito' ? this.adicionalCredito : 0,
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

    const dataVenta = {
      dataVenta: venta,
      dataFacturacion: facturacion,
      dataFormasPago: formasPago,
      dataProductos: [],
      dataOtros: {
        imprimirTicket: this.imprimirTicket
      }
    }

    this.alertService.question({ msg: '¿Quieres completar la reserva?', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          // Adaptando - Fechas
          let fechaEntregaCompleta = this.dataReserva.fechaEntrega + ':' + this.dataReserva.horaEntrega;
          let fechaAlerta = format(add(new Date(fechaEntregaCompleta), { hours: -Number(this.dataReserva.horasAntes) }), 'yyyy-MM-dd:HH:mm')

          // Adaptando - Productos
          let listadoProductos: any[] = [];
          this.carritoProductos.map(producto => {
            listadoProductos.push({
              productoId: producto.producto.id,
              cantidad: producto.cantidad,
              precioUnitario: producto.producto.precioVenta,
              precioTotal: producto.precioTotal
            });
          })

          const dataReserva: any = {
            productos: listadoProductos,
            clienteId: this.clienteSeleccionado.id,
            usuarioCreador: this.dataReserva.usuarioCreador,
            fechaReserva: this.dataReserva.fechaReserva,
            fechaEntrega: this.dataReserva.fechaEntrega,
            horaEntrega: this.dataReserva.horaEntrega,
            adelanto: this.dataReserva.adelanto,
            precioTotal: this.dataReserva.precioTotal,
            observaciones: this.dataReserva.observaciones,
            horasAntes: this.dataReserva.horasAntes,
            tipoObservacion: this.dataReserva.tipoObservacion,
            fechaAlerta,
            tortaRelleno1: this.dataReserva.tipoObservacion === 'Torta' ? this.dataReserva.tortaRelleno1 : '',
            tortaRelleno2: this.dataReserva.tipoObservacion === 'Torta' ? this.dataReserva.tortaRelleno2 : '',
            tortaRelleno3: this.dataReserva.tipoObservacion === 'Torta' ? this.dataReserva.tortaRelleno3 : '',
            tortaForma: this.dataReserva.tipoObservacion === 'Torta' ? this.dataReserva.tortaForma : '',
            tortaPeso: this.dataReserva.tipoObservacion === 'Torta' ? this.dataReserva.tortaPeso : 0,
            tortaCobertura: this.dataReserva.tipoObservacion === 'Torta' ? this.dataReserva.tortaCobertura : '',
            tortaDetalles: this.dataReserva.tipoObservacion === 'Torta' ? this.dataReserva.tortaDetalles : '',
            creatorUserId: this.authService.usuario.userId
          }
          // Se crea la reserva
          this.reservasService.nuevaReserva(dataReserva).subscribe({
            next: ({ reserva }) => {
              // Se crea la venta
              this.ventasService.nuevaVenta(dataVenta).subscribe({
                next: ({ venta }) => {
                  const dataVentaReserva = {
                    ventaId: venta.id,
                    reservaId: reserva.id,
                    tipo: 'Adelanto',
                    creatorUserId: this.authService.usuario.userId
                  }
                  // Se crea la relacion -> Venta - Reserva
                  this.ventasReservasService.nuevaVentaReserva(dataVentaReserva).subscribe({
                    next: () => {
                      this.router.navigateByUrl('/dashboard/reservas');
                      this.dataService.alertaReservas();
                      this.alertService.close();
                    }, error: ({ error }) => this.alertService.errorApi(error.message)
                  })
                }, error: ({ error }) => this.alertService.errorApi(error.message)
              })
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });

  }

}
