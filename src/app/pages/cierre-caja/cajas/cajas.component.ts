import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { CajasService } from '../../../services/cajas.service';
import { AlertService } from '../../../services/alert.service';
import { MonedaPipe } from '../../../pipes/moneda.pipe';

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
    TarjetaListaComponent,
  ],
  selector: 'app-cajas',
  templateUrl: './cajas.component.html',
  styleUrls: []
})
export default class CajasComponent implements OnInit {

  // Modal
  public showModalCaja = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Caja
  public idCaja: string = '';
  public cajas: any = [];
  public cajaSeleccionada: any;
  public descripcion: string = '';

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: '',
    parametro: '',
    fechaDesde: '',
    fechaHasta: '',
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'id'
  }

  constructor(
    private cajasService: CajasService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Equinoccio - Listado de cajas';
    this.alertService.loading();
    this.listarCajas();
  }

  // Listar cajas
  listarCajas(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      activo: this.filtro.activo,
      fechaDesde: this.filtro.fechaDesde,
      fechaHasta: this.filtro.fechaHasta,
    }
    this.cajasService.listarCajas(parametros).subscribe({
      next: ({ cajas, totalItems }) => {
        this.totalItems = totalItems;
        this.cajas = cajas;
        this.showModalCaja = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
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
    this.listarCajas();
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.alertService.loading();
    this.paginaActual = nroPagina;
    // this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.listarCajas();
  }

}
