import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { IngresosService } from '../../services/ingresos.service';
import { format } from 'date-fns';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router, RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroIngresosPipe } from '../../pipes/filtro-ingresos.pipe';

@Component({
  standalone: true,
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroIngresosPipe
  ],
  styleUrls: []
})
export default class IngresosComponent implements OnInit {

  // Modal
  public showModalIngreso = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Ingreso
  public idIngreso: string = '';
  public ingresos: any = [];
  public ingresoSeleccionado: any;

  public ingresoForm: any = {
    fechaIngreso: format(new Date(), 'yyyy-MM-dd'),
    nroFactura: '',
    comentario: '',
  }

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

  constructor(
    private ingresosService: IngresosService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ingresos';
    this.alertService.loading();
    this.listarIngresos();
  }

  // Abrir modal
  abrirModal(estado: string, ingreso: any = null): void {
    this.reiniciarFormulario();
    this.idIngreso = '';
    if (estado === 'editar') this.getIngreso(ingreso);
    else this.showModalIngreso = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de ingreso
  getIngreso(ingreso: any): void {
    this.alertService.loading();
    this.idIngreso = ingreso.id;
    this.ingresoSeleccionado = ingreso;
    this.ingresosService.getIngreso(ingreso.id).subscribe({
      next: ({ ingreso }) => {
        this.ingresoForm = {
          fechaIngreso: format(ingreso.fechaIngreso, 'yyyy-MM-dd'),
          nroFactura: ingreso.nroFactura,
          comentario: ingreso.comentario,
        }
        this.alertService.close();
        this.showModalIngreso = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar ingreso
  listarIngresos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      estado: this.filtro.estado,
      parametro: this.filtro.parametro,
      fechaDesde: this.filtro.fechaDesde,
      fechaHasta: this.filtro.fechaHasta,
    }
    this.ingresosService.listarIngresos(parametros).subscribe({
      next: ({ ingresos, totalItems }) => {
        this.ingresos = ingresos;
        this.totalItems = totalItems;
        this.showModalIngreso = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo ingreso
  nuevoIngreso(): void {

    const { fechaIngreso, nroFactura, comentario } = this.ingresoForm;

    // Se verificac que la fecha de ingreso no esta vacia
    if (!fechaIngreso) return this.alertService.info('La fecha de ingreso es obligatoria');

    this.alertService.loading();

    const data = {
      fechaIngreso: new Date(fechaIngreso),
      nroFactura,
      comentario,
      creatorUserId: this.authService.usuario.userId,
      usuarioCompletadoId: this.authService.usuario.userId
    }

    this.ingresosService.nuevoIngreso(data).subscribe({
      next: ({ ingreso }) => {
        this.router.navigateByUrl(`/dashboard/ingresos/detalles/${ingreso.id}`);
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar ingreso
  actualizarIngreso(): void {

    const { fechaIngreso, nroFactura, comentario } = this.ingresoForm;

    // Se verificac que la fecha de ingreso no esta vacia
    if (!fechaIngreso) return this.alertService.info('La fecha de ingreso es obligatoria');

    this.alertService.loading();

    const data = {
      fechaIngreso,
      nroFactura,
      comentario,
    }

    this.ingresosService.actualizarIngreso(this.idIngreso, data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarIngresos();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(ingreso: any): void {

    const { id, activo } = ingreso;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ingresosService.actualizarIngreso(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarIngresos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.ingresoForm = {
      fechaIngreso: format(new Date(), 'yyyy-MM-dd'),
      nroFactura: '',
      comentario: '',
    }
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
    this.listarIngresos();
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.alertService.loading();
    this.listarIngresos();
  }

}
