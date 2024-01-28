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
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { FiltroTiposIngresosPipe } from '../../pipes/filtro-tipos-ingresos.pipe';

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
    FiltroTiposIngresosPipe
  ],
  styleUrls: []
})
export default class TiposIngresosComponent implements OnInit {

  // Modal
  public showModalTipo = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Tipo
  public idTipo: string = '';
  public tipos: any = [];
  public tipoSeleccionado: any;
  public descripcion: string = '';

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
    private tiposIngresosService: TiposIngresosService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Tipos de ingresos';
    this.alertService.loading();
    this.listarTipos();
  }

  // Abrir modal
  abrirModal(estado: string, tipo: any = null): void {
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idTipo = '';

    if (estado === 'editar') this.getTipo(tipo);
    else this.showModalTipo = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de tipo
  getTipo(tipo: any): void {
    this.alertService.loading();
    this.idTipo = tipo.id;
    this.tipoSeleccionado = tipo;
    this.tiposIngresosService.getTipo(tipo.id).subscribe({
      next: ({ tipo }) => {
        this.descripcion = tipo.descripcion;
        this.alertService.close();
        this.showModalTipo = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar tipos
  listarTipos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.tiposIngresosService.listarTipos(parametros).subscribe({
      next: ({ tipos }) => {
        this.tipos = tipos;
        this.showModalTipo = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo tipo
  nuevoTipo(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      creatorUserId: this.authService.usuario.userId,
    }

    this.tiposIngresosService.nuevoTipo(data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarTipos();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar tipo
  actualizarTipo(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
    }

    this.tiposIngresosService.actualizarTipo(Number(this.idTipo), data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarTipos();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(tipo: any): void {

    const { id, activo } = tipo;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.tiposIngresosService.actualizarTipo(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarTipos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.descripcion = '';
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
