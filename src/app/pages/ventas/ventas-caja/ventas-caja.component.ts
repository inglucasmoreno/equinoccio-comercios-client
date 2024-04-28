import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import { formasPagoArray } from '../../../constants/formasPagoArray';
import { tiposVenta } from '../../../constants/tiposVenta';
import { VentasService } from '../../../services/ventas.service';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import { VentasFormasPagoService } from '../../../services/ventas-formas-pago.service';
import { environments } from '../../../../environments/environments';

const baseUrl = environments.base_url;

@Component({
  standalone: true,
  selector: 'app-ventas-caja',
  templateUrl: './ventas-caja.component.html',
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
  ],
  styleUrls: []
})
export default class VentasCajasComponent implements OnInit {

  // Flags
  public showFormaPago = false;
  public showProductos = false;
  public showFacturacion = false;

  // Caja
  public idCaja: any[] = [];

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
    private dataService: DataService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ventas en caja';
    this.activatedRoute.params.subscribe({
      next: ({ idCaja }) => {
        this.idCaja = idCaja;
        this.listarVentas();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Listar ventas
  listarVentas(): void {
    this.alertService.loading();
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      formaPago: this.filtro.formaPago,
      comprobante: this.filtro.comprobante,
      pagina: this.paginaActual,
      cajaId: this.idCaja,
      itemsPorPagina: this.cantidadItems,
    }
    this.ventasService.listarVentas(parametros).subscribe({
      next: ({ ventas, totalItems, totales }) => {
        this.totalItems = totalItems;
        this.ventas = ventas;
        this.totales = totales;
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

  // Generar comprobate
  generarComprobante(idVenta: string): void {
    window.open(`${baseUrl}/ventas/generar/comprobante/${idVenta}`, '_blank');
  }

  // Generar comprobate - Venta Normal
  generarComprobanteVenta(idVenta: string): void {
    window.open(`${baseUrl}/ventas/generar/comprobante/${idVenta}`, '_blank');
  }

  // Generar comprobate - Fiscal
  generarComprobanteVentaFiscal(idVenta: string): void {
    console.log('Fiscal');
    window.open(`${baseUrl}/ventas/generar/comprobante/fiscal/${idVenta}`, '_blank');
  }

  // Generar comprobate - Reserva
  generarComprobanteReserva(idReserva: string): void {
    window.open(`${baseUrl}/reservas/generar/comprobante/${idReserva}`, '_blank');
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
