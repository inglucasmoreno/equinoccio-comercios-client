import { Component, OnInit } from '@angular/core';
import { MarcasService } from '../../services/marcas.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroUnidadesMedidaPipe } from '../../pipes/filtro-unidades-medida.pipe';

@Component({
  standalone: true,
  selector: 'app-marcas',
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
  templateUrl: './marcas.component.html',
  styleUrls: []
})
export default class MarcasComponent implements OnInit {

  // Modal
  public showModalMarca = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Marca
  public idMarca: string = '';
  public marcas: any = [];
  public marcaSeleccionada: any;
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
    private marcasService: MarcasService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Marcas';
    this.alertService.loading();
    this.listarMarcas();
  }

  // Abrir modal
  abrirModal(estado: string, marca: any = null): void {
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idMarca = '';

    if (estado === 'editar') this.getMarca(marca);
    else this.showModalMarca = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de marca
  getMarca(marca: any): void {
    this.alertService.loading();
    this.idMarca = marca.id;
    this.marcaSeleccionada = marca;
    this.marcasService.getMarca(marca.id).subscribe({
      next: ({ marca }) => {
        this.descripcion = marca.descripcion;
        this.alertService.close();
        this.showModalMarca = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar marcas
  listarMarcas(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.marcasService.listarMarcas(parametros).subscribe({
      next: ({ marcas }) => {
        this.marcas = marcas;
        this.showModalMarca = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nueva marca
  nuevaMarca(): void {

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

    this.marcasService.nuevaMarca(data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarMarcas();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar marca
  actualizarMarca(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
    }

    this.marcasService.actualizarMarca(this.idMarca, data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarMarcas();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(marca: any): void {

    const { id, activo } = marca;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.marcasService.actualizarMarca(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarMarcas();
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
    this.listarMarcas();
  }

}
