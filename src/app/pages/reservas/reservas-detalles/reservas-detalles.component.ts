import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReservasService } from '../../../services/reservas.service';
import { DataService } from '../../../services/data.service';
import { AlertService } from '../../../services/alert.service';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import { format } from 'date-fns';
import { generales } from '../../../constants/generales';
import { formasPagoArray } from '../../../constants/formasPagoArray';
import { formasPagoArrayMulti } from '../../../constants/formasPagoArrayMulti';
import { AuthService } from '../../../services/auth.service';
import { VentasService } from '../../../services/ventas.service';
import { VentasReservasService } from '../../../services/ventas-reservas.service';

interface FormaPago {
  valor: number;
  descripcion: string;
  nroComprobante?: string;
  creatorUserId: number;
}

@Component({
  standalone: true,
  selector: 'app-reservas-detalles',
  templateUrl: './reservas-detalles.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    MonedaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export default class ReservasDetallesComponent implements OnInit {

  // Flag
  public showActualizarUsuarioGenerador: boolean = false;
  public showActualizarObservaciones: boolean = false;
  public showModalCompletar: boolean = false;

  // Fechas
  public fechaReserva: string = '';
  public fechaEntrega: string = '';
  public horaEntrega: string = '';

  // Reserva
  public reserva: any = null;
  public usuarioGenerador: string = '';

  // Observaciones
  public tipoObservacion: string = 'General';
  public observaciones: string = '';
  public tortaRelleno1: string = '';
  public tortaRelleno2: string = '';
  public tortaRelleno3: string = '';
  public tortaPeso: string = '';
  public tortaForma: string = '';
  public tortaDetalles: string = '';
  public tortaCobertura: string = '';

  // Multiples formas de pago
  public totalPagado = 0;
  public faltaPagar = 0;
  public multiplesFormasPago: boolean = false;
  public formasPago: FormaPago[] = [];

  public formasPagoArray: any[] = formasPagoArray;

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

  constructor(
    private authService: AuthService,
    private reservasService: ReservasService,
    private ventasService: VentasService,
    private ventasReservasService: VentasReservasService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Detalles de reserva';
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({ id }) => {
      this.obtenerReserva(id);
    })
  }

  obtenerReserva(id: any): void {
    this.reservasService.getReserva(id).subscribe({
      next: ({ reserva }) => {
        console.log(reserva);
        this.fechaReserva = format(reserva.fechaReserva, 'yyyy-MM-dd');
        this.fechaEntrega = format(reserva.fechaEntrega, 'yyyy-MM-dd');
        this.horaEntrega = reserva.horaEntrega;
        this.reserva = reserva;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message)
      }
    })
  }

  actualizarFechaReserva(): void {

    if (!this.fechaReserva) {
      this.alertService.info('Debe colocar una fecha de reserva vàlida');
      return;
    }

    this.alertService.loading();

    this.reservasService.actualizarReserva(this.reserva.id, { fechaReserva: this.fechaReserva }).subscribe({
      next: () => {
        this.alertService.success('Fecha de reserva actualizada!');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  abrirActualizarUsuarioGenerador(): void {
    this.showActualizarUsuarioGenerador = true;
    this.usuarioGenerador = this.reserva.usuarioCreador;
  }

  abrirActualizarObservaciones(): void {
    this.showActualizarObservaciones = true;
    this.tipoObservacion = this.reserva.tipoObservacion;
    this.observaciones = this.reserva.observaciones;
    this.tortaRelleno1 = this.reserva.tortaRelleno1;
    this.tortaRelleno2 = this.reserva.tortaRelleno2;
    this.tortaRelleno3 = this.reserva.tortaRelleno3;
    this.tortaPeso = this.reserva.tortaPeso === 0 ? null : this.reserva.tortaPeso;
    this.tortaForma = this.reserva.tortaForma;
    this.tortaDetalles = this.reserva.tortaDetalles;
    this.tortaCobertura = this.reserva.tortaCobertura;
  }

  actualizarUsuarioGenerador(): void {

    if (this.usuarioGenerador === '') {
      this.alertService.info('Debe colocar un usuario generador');
      return;
    }

    this.alertService.loading();

    this.reservasService.actualizarReserva(this.reserva.id, { usuarioCreador: this.usuarioGenerador }).subscribe({
      next: ({ reserva }) => {
        this.alertService.success('Usuario generador actualizado!');
        this.reserva.usuarioCreador = reserva.usuarioCreador;
        this.showActualizarUsuarioGenerador = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  actualizarObservaciones(): void {

    if (this.tipoObservacion === 'Torta' && this.tortaRelleno1.trim() === '') return this.alertService.info('Debe colocar el primer relleno de la torta');
    if (this.tipoObservacion === 'Torta' && this.tortaForma.trim() === '') return this.alertService.info('Debe colocar la forma de la torta');
    if (this.tipoObservacion === 'Torta' && !this.tortaPeso) return this.alertService.info('Debe colocar el peso de la torta');
    if (this.tipoObservacion === 'Torta' && !this.tortaCobertura) return this.alertService.info('Debe colocar la cobertura de la torta');

    this.alertService.loading();

    this.reservasService.actualizarReserva(this.reserva.id, {
      observaciones: this.observaciones,
      tipoObservacion: this.tipoObservacion,
      tortaRelleno1: this.tipoObservacion === 'Torta' ? this.tortaRelleno1 : '',
      tortaRelleno2: this.tipoObservacion === 'Torta' ? this.tortaRelleno2 : '',
      tortaRelleno3: this.tipoObservacion === 'Torta' ? this.tortaRelleno3 : '',
      tortaPeso: this.tipoObservacion === 'Torta' ? this.tortaPeso : 0,
      tortaForma: this.tipoObservacion === 'Torta' ? this.tortaForma : '',
      tortaCobertura: this.tipoObservacion === 'Torta' ? this.tortaCobertura : '',
      tortaDetalles: this.tipoObservacion === 'Torta' ? this.tortaDetalles : ''
    }).subscribe({
      next: ({ reserva }) => {
        this.alertService.success('Observaciones actualizadas!');
        this.reserva.tipoObservacion = reserva.tipoObservacion;
        this.reserva.observaciones = reserva.observaciones;
        this.reserva.tortaRelleno1 = reserva.tortaRelleno1;
        this.reserva.tortaRelleno2 = reserva.tortaRelleno2;
        this.reserva.tortaRelleno3 = reserva.tortaRelleno3;
        this.reserva.tortaPeso = reserva.tortaPeso;
        this.reserva.tortaForma = reserva.tortaForma;
        this.reserva.tortaCobertura = reserva.tortaCobertura;
        this.reserva.tortaDetalles = reserva.tortaDetalles;
        this.showActualizarObservaciones = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  cambiarFormaPago(): void {
    if (!this.multiplesFormasPago) this.calcularPrecioFinal();
  }

  cambiarImprimirTicket(): void {
    this.imprimirTicket = !this.imprimirTicket;
  }

  calcularPrecioFinal(): void {

    this.precioTotalVenta = this.reserva.precioTotal - this.reserva.adelanto;
    this.precioTotalLimpio = this.reserva.precioTotal - this.reserva.adelanto;
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

  }

  calcularVuelto(): void {
    this.vuelto = this.pagaCon - this.precioTotalVenta;
    if (this.vuelto < 0) this.vuelto = null;
  }

  eliminarFormaPago(descripcion: string): void {
    this.formasPago = this.formasPago.filter((formaPago: any) => formaPago.descripcion != descripcion);
    this.totalPagado = 0;
    this.formasPago.forEach((formaPago: any) => {
      this.totalPagado += formaPago.valor;
    });
    this.calcularFaltaPagar();
  }

  calcularFaltaPagar(): void {
    this.faltaPagar = this.precioTotalVenta - this.totalPagado;
    this.faltaPagar = Math.round(this.faltaPagar * 100) / 100;  // Se redondea a dos decimales
    this.valorFormaPago = this.faltaPagar;
  }

  abrirCompletarReserva(): void {
    this.showModalCompletar = true;
    this.precioTotalVenta = this.reserva.precioTotal - this.reserva.adelanto;
    this.precioTotalLimpio = this.reserva.precioTotal - this.reserva.adelanto;
    this.formaPago = 'Efectivo';
  }

  completarReserva(): void {

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
      totalAdelantoReserva: 0,
      totalCompletarReserva: this.precioTotalVenta,
      totalBalanza: 0,
      totalNoBalanza: 0,
      precioTotalLimpio: this.precioTotalLimpio,
      adicionalCredito: !this.multiplesFormasPago && this.formaPago === 'Credito' ? this.adicionalCredito : 0,
      creatorUserId: this.authService.usuario.userId
    }

    // Datos de productos
    let productos: any[] = [];
    this.reserva.reservasProductos.map((item: any) => {
      productos.push({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        precioTotal: item.precioTotal,
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
      dataProductos: productos,
      dataOtros: {
        imprimirTicket: this.imprimirTicket
      }
    }

    this.alertService.question({ msg: '¿Quieres completar la reserva?', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          this.reservasService.actualizarReserva(this.reserva.id, { estado: 'Completada', activo: false }).subscribe({
            next: () => {
              this.ventasService.nuevaVenta(dataVenta).subscribe({
                next: ({ venta }) => {
                  const dataVentaReserva = {
                    ventaId: venta.id,
                    reservaId: this.reserva.id,
                    tipo: 'Completada',
                    creatorUserId: this.authService.usuario.userId
                  }
                  // Se crea la relacion -> Venta - Reserva
                  this.ventasReservasService.nuevaVentaReserva(dataVentaReserva).subscribe({
                    next: () => {
                      this.router.navigateByUrl('/dashboard/reservas');
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

  noSeRetiro(): void {
    this.alertService.question({ msg: '¿Quieres dar de baja la reserva?', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.reservasService.actualizarReserva(this.reserva.id, { estado: 'No retirada', activo: false }).subscribe({
            next: () => {
              this.reserva.estado = 'No retirada';
              this.reserva.activo = false;
              this.showModalCompletar = false;
              this.router.navigateByUrl('/dashboard/reservas');
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  altaReserva(): void {
    this.alertService.question({ msg: '¿Quieres dar de alta la reserva?', buttonText: 'Aceptar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.alertService.loading();
        this.reservasService.actualizarReserva(this.reserva.id, { estado: 'Pendiente', activo: true }).subscribe({
          next: () => {
            this.reserva.estado = 'Pendiente';
            this.reserva.activo = true;
            this.alertService.success('Reserva dada de alta!');
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }
    });
  }

}
