import { Component, OnInit } from '@angular/core';
import { UnidadesMedidaService } from '../../services/unidades-medida.service';
import { AuthService } from '../../services/auth.service';
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
    FiltroUnidadesMedidaPipe
  ],
  templateUrl: './unidades-medida.component.html',
  styleUrls: []
})
export default class UnidadesMedidaComponent implements OnInit {

  // Modal
  public showModalUnidad = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Unidad de medida
  public idUnidad: string = '';
  public unidades: any = [];
  public unidadSeleccionada: any;
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
    private unidadMedidaService: UnidadesMedidaService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Unidades de medida';
    this.alertService.loading();
    this.listarUnidades();
  }

  // Abrir modal
  abrirModal(estado: string, unidad: any = null): void {
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idUnidad = '';

    if (estado === 'editar') this.getUnidad(unidad);
    else this.showModalUnidad = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de unidad
  getUnidad(unidad: any): void {
    this.alertService.loading();
    this.idUnidad = unidad.id;
    this.unidadSeleccionada = unidad;
    this.unidadMedidaService.getUnidad(unidad.id).subscribe({
      next: ({ unidad }) => {
        this.descripcion = unidad.descripcion;
        this.alertService.close();
        this.showModalUnidad = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar unidades
  listarUnidades(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.unidadMedidaService.listarUnidades(parametros).subscribe({
      next: ({ unidades }) => {
        this.unidades = unidades;
        this.showModalUnidad = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nueva unidad
  nuevaUnidad(): void {

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

    this.unidadMedidaService.nuevaUnidad(data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarUnidades();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar unidad
  actualizarUnidad(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
    }

    this.unidadMedidaService.actualizarUnidad(this.idUnidad, data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarUnidades();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(unidad: any): void {

    const { id, activo } = unidad;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.unidadMedidaService.actualizarUnidad(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarUnidades();
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
    this.listarUnidades();
  }

}
