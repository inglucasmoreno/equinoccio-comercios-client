import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import { VentasService } from '../../../services/ventas.service';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import { FiltroVentasPipe } from '../../../pipes/filtro-ventas.pipe';
import { formasPagoArray } from '../../../constants/formasPagoArray';
import { VentasFormasPagoService } from '../../../services/ventas-formas-pago.service';
import { tiposVenta } from '../../../constants/tiposVenta';

@Component({
  standalone: true,
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
    FiltroVentasPipe
  ],
  selector: 'app-ventas-activas',
  templateUrl: './ventas-activas.component.html',
  styleUrls: []
})
export default class VentasActivasComponent implements OnInit {

  // Constantes
  public formasPago: any[] = formasPagoArray;
  public tiposVenta: any[] = tiposVenta;

  // Modal
  public showModalVenta = false;

  // Actualizar forma de pago
  public comprobantePedidosYa = '';
  public actualizandoFormaPago = false;
  public nuevaFormaPago: string = 'Efectivo';
  public nuevoComprobante: string = '';
  public formaPagoSeleccionada: any = null;

  // Ventas
  public idVenta: string = '';
  public ventas: any = [];
  public ventaSeleccionada: any;
  public descripcion: string = '';

  public totales = {
    totalVentas: 0,
    totalVentasFacturadas: 0,
    totalVentasPedidosYa: 0,
  }

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    formaPago: '',
    comprobante: '',
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(
    private ventasService: VentasService,
    private alertService: AlertService,
    private ventasFormasPagoService: VentasFormasPagoService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ventas activas';
    this.listarVentas();
  }

  // Listar ventas
  listarVentas(): void {
    this.alertService.loading();
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      activo: 'true',
      formaPago: this.filtro.formaPago,
      comprobante: this.filtro.comprobante,
      pagina: this.paginaActual,
      itemsPorPagina: this.cantidadItems,

    }
    this.ventasService.listarVentas(parametros).subscribe({
      next: ({ ventas, totalItems, totales }) => {
        this.totalItems = totalItems;
        this.ventas = ventas;
        this.totales = totales;
        console.log(ventas);
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  seleccionarVenta(venta: any): void {
    this.ventaSeleccionada = venta;
    this.actualizandoFormaPago = false;
    this.formaPagoSeleccionada = null;
    this.showModalVenta = true;
  }

  abrirActualizarFormaPago(formaPago: any): void {
    this.nuevaFormaPago = formaPago.descripcion;
    this.comprobantePedidosYa = formaPago.nroComprobante;
    this.actualizandoFormaPago = true;
    this.formaPagoSeleccionada = formaPago;
  }

  cerrarActualizarFormaPago(): void {
    this.actualizandoFormaPago = false;
    this.formaPagoSeleccionada = null;
  }

  actualizarFormaPago(): void {

    const condPedidosYa = this.nuevaFormaPago === 'PedidosYa - Efectivo' || this.nuevaFormaPago === 'PedidosYa - Online';

    if (this.comprobantePedidosYa === '' && condPedidosYa) return this.alertService.info('Debe ingresar el numero de comprobante');

    this.alertService.loading();
    this.ventasFormasPagoService.actualizarVentaFormaPago(this.formaPagoSeleccionada.id, {
      descripcion: this.nuevaFormaPago,
      nroComprobante: condPedidosYa ? this.comprobantePedidosYa : ''
    }).subscribe({
      next: () => {
        // Se le agrega el nuevo valor a la forma de pago
        this.formaPagoSeleccionada.descripcion = this.nuevaFormaPago;
        this.formaPagoSeleccionada.nroComprobante = condPedidosYa ? this.comprobantePedidosYa : '';
        this.formaPagoSeleccionada = null;
        this.actualizandoFormaPago = false;
        this.alertService.success('Forma de pago actualizada');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 'asc' ? 'desc' : 'asc';
    this.listarVentas();
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    // this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.listarVentas();
  }

}
