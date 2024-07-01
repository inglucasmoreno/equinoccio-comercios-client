import { Component, OnInit } from '@angular/core';
import { UnidadesMedidaService } from '../../services/unidades-medida.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { ModalComponent } from '../../components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FiltroUnidadesMedidaPipe } from '../../pipes/filtro-unidades-medida.pipe';
import AbmUnidadMedidaComponent from './abm-unidad-medida/abm-unidad-medida.component';
import { PermisosDirective } from '../../directives/permisos.directive';

@Component({
  standalone: true,
  selector: 'app-unidades-medida',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    AbmUnidadMedidaComponent,
    FiltroUnidadesMedidaPipe,
    PermisosDirective
  ],
  templateUrl: './unidades-medida.component.html',
  styleUrls: []
})
export default class UnidadesMedidaComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['UNIDADES_MEDIDA_ALL'];

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
    public unidadesMedidaService: UnidadesMedidaService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Equinoccio - Unidades de medida';
    this.alertService.loading();
    this.listarUnidades();
  }

  abrirAbm(estado: 'crear' | 'editar', unidad: any = null): void {
    this.unidadesMedidaService.abrirAbm(estado, unidad);
  }

  // Listar unidades
  listarUnidades(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.unidadesMedidaService.listarUnidades(parametros).subscribe({
      next: ({ unidades }) => {
        this.unidadesMedidaService.unidadesMedida = unidades;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  nuevaUnidad(unidad): void {
    this.unidadesMedidaService.unidadesMedida = [unidad, ...this.unidadesMedidaService.unidadesMedida];
    this.alertService.close();
  }

  actualizarUnidad(unidad): void {
    const index = this.unidadesMedidaService.unidadesMedida.findIndex((u: any) => u.id === unidad.id);
    this.unidadesMedidaService.unidadesMedida[index] = unidad;
    this.unidadesMedidaService.unidadesMedida = [... this.unidadesMedidaService.unidadesMedida];
    this.alertService.close();
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(unidad: any): void {

    const { id, activo } = unidad;

    this.alertService.question({ msg: unidad.activo ? 'Baja de elemento' : 'Alta de elemento', buttonText: unidad.activo ? 'Dar de baja' : 'Dar de alta' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.unidadesMedidaService.actualizarUnidad(id, { activo: !activo }).subscribe({
            next: () => {
              this.listarUnidades();
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
    this.listarUnidades();
  }

}
