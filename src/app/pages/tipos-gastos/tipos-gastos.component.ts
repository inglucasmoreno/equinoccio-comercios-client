import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroTiposGastosPipe } from '../../pipes/filtro-tipos-gastos.pipe';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { TiposGastosService } from '../../services/tipos-gastos.service';
import AbmTipoGastoComponent from './abm-tipo-gasto/abm-tipo-gasto.component';

@Component({
  standalone: true,
  selector: 'app-tipos-gastos',
  templateUrl: './tipos-gastos.component.html',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroTiposGastosPipe,
    AbmTipoGastoComponent
  ],
  styleUrls: []
})
export default class TiposGastosComponent implements OnInit {

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
    public tiposGastosService: TiposGastosService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Tipos de gastos';
    this.alertService.loading();
    this.listarTipos();
  }

  abrirAbm(estado: 'crear' | 'editar', tipo: any = null): void {
    this.tiposGastosService.abrirAbm(estado, tipo);
  }

  nuevoTipo(tipo): void {
    this.tiposGastosService.tipos = [tipo, ...this.tiposGastosService.tipos];
    this.alertService.close();
  }

  actualizarTipo(tipo): void {
    const index = this.tiposGastosService.tipos.findIndex((t: any) => t.id === tipo.id);
    this.tiposGastosService.tipos[index] = tipo;
    this.tiposGastosService.tipos = [... this.tiposGastosService.tipos];
    this.alertService.close();
  }

  // Listar tipos
  listarTipos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.tiposGastosService.listarTipos(parametros).subscribe({
      next: ({ tipos }) => {
        this.tiposGastosService.tipos = tipos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(tipo: any): void {

    const { id, activo } = tipo;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.tiposGastosService.actualizarTipo(id, { activo: !activo }).subscribe({
            next: () => {
              this.listarTipos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
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
    this.listarTipos();
  }
}
