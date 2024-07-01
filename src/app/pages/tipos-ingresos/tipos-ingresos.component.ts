import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { TiposIngresosService } from '../../services/tipos-ingresos.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { FiltroTiposIngresosPipe } from '../../pipes/filtro-tipos-ingresos.pipe';
import AbmTipoIngresoComponent from './abm-tipo-ingreso/abm-tipo-ingreso.component';
import { PermisosDirective } from '../../directives/permisos.directive';

@Component({
  standalone: true,
  selector: 'app-tipos-ingresos',
  templateUrl: './tipos-ingresos.component.html',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroTiposIngresosPipe,
    AbmTipoIngresoComponent,
    PermisosDirective
  ],
  styleUrls: []
})
export default class TiposIngresosComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['TIPOS_INGRESOS_ALL'];

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
    public tiposIngresosService: TiposIngresosService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Equinoccio - Tipos de ingresos';
    this.alertService.loading();
    this.listarTipos();
  }

  abrirAbm(estado: 'crear' | 'editar', tipo: any = null): void {
    this.tiposIngresosService.abrirAbm(estado, tipo);
  }

  // Listar tipos
  listarTipos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.tiposIngresosService.listarTipos(parametros).subscribe({
      next: ({ tipos }) => {
        this.tiposIngresosService.tipos = tipos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  nuevoTipo(tipo): void {
    this.tiposIngresosService.tipos = [tipo, ...this.tiposIngresosService.tipos];
    this.alertService.close();
  }

  actualizarTipo(tipo): void {
    const index = this.tiposIngresosService.tipos.findIndex((t: any) => t.id === tipo.id);
    this.tiposIngresosService.tipos[index] = tipo;
    this.tiposIngresosService.tipos = [... this.tiposIngresosService.tipos];
    this.alertService.close();
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(tipo: any): void {

    const { id, activo } = tipo;

    this.alertService.question({ msg: tipo.activo ? 'Baja de elemento' : 'Alta de elemento', buttonText: tipo.activo ? 'Dar de baja' : 'Dar de alta' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.tiposIngresosService.actualizarTipo(id, { activo: !activo }).subscribe({
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
