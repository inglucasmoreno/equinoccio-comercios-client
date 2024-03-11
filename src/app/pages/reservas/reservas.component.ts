import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { ReservasService } from '../../services/reservas.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';
import { ClientesService } from '../../services/clientes.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    TarjetaListaComponent,
  ],
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: []
})
export default class ReservasComponent implements OnInit, AfterViewInit {

  // Reservas
  public reservas: any = [];
  public flagBuscandoReservas: boolean = false;

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    estado: 'Pendiente',
    parametro: '',
    fechaDesde: '',
    fechaHasta: '',
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'id'
  }

  @ViewChild('searchInput')
  public searchInput?: ElementRef;

  constructor(
    private reservasService: ReservasService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngAfterViewInit(): void {

    // Busqueda de reservas en el backend
    fromEvent<any>(this.searchInput?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(text => {
        this.filtro.parametro = text;
        this.flagBuscandoReservas = true;
        this.paginaActual = 1;
        this.listarReservas();
      })

  }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Reservas';
    this.alertService.loading();
    this.listarReservas();
  }

  // Listar reservas
  listarReservas(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      parametro: this.filtro.parametro,
      fechaDesde: this.filtro.fechaDesde,
      fechaHasta: this.filtro.fechaHasta,
      estado: this.filtro.estado
    }
    this.reservasService.listarReservas(parametros).subscribe({
      next: ({ reservas, totalItems }) => {
        this.reservas = reservas;
        this.totalItems = totalItems;
        this.flagBuscandoReservas = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Filtrar por estado
  filtrarEstado(estado: any): void {
    this.paginaActual = 1;
    this.filtro.estado = estado;
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
    this.listarReservas();
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.alertService.loading();
    this.listarReservas();
  }

}
