import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { ProveedoresService } from '../../services/proveedores.service';
import { FiltroProveedoresPipe } from '../../pipes/filtro-proveedores.pipe';
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';

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
    FiltroIngresosPipe,
    FiltroProveedoresPipe
  ],
  styleUrls: []
})
export default class IngresosComponent implements OnInit, AfterViewInit {

  // Flags
  public estadoFormulario = 'crear';
  public flagBuscandoIngresos: boolean = false;

  // Modal
  public showModalIngreso = false;
  public showModalProveedor = false;

  // Buscador - Proveedores
  public showBuscadorProveedores = false;
  public proveedores: any[] = [];
  public proveedorSeleccionado: any = null;

  // Ingreso
  public ingresos: any = [];
  public ingresoSeleccionado: any;

  public ingresoForm: any = {
    fechaIngreso: format(new Date(), 'yyyy-MM-dd'),
    nroFactura: '',
    comentario: '',
  }

  public proveedorForm = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    telefono: '',
    domicilio: '',
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

  public filtroProveedor = {
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'id'
  }

  @ViewChild('searchInput')
  public searchInput?: ElementRef;

  constructor(
    private ingresosService: IngresosService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private dataService: DataService,
    private proveedoresService: ProveedoresService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ingresos';
    this.alertService.loading();
    this.listarIngresos();
  }

  ngAfterViewInit(): void {

    // Busqueda de reservas en el backend
    fromEvent<any>(this.searchInput?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(text => {
        this.filtro.parametro = text;
        this.flagBuscandoIngresos = true;
        this.paginaActual = 1;
        this.listarIngresos();
      })

  }

  // Abrir modal
  abrirModal(estado: string, ingreso: any = null): void {
    this.alertService.loading();
    this.proveedorSeleccionado = null;
    this.filtroProveedor.parametro = '';
    this.proveedoresService.listarProveedores({
      direccion: 'asc',
      columna: 'descripcion',
      activo: 'true'
    }).subscribe({
      next: ({ proveedores }) => {
        this.proveedores = proveedores;
        this.reiniciarFormulario();
        if (estado === 'editar') {
          this.ingresoSeleccionado = ingreso;
          this.ingresoForm = {
            fechaIngreso: format(ingreso.fechaIngreso, 'yyyy-MM-dd'),
            nroFactura: ingreso.nroFactura,
            comentario: ingreso.comentario,
          }
          this.proveedorSeleccionado = ingreso.proveedor;
        }
        this.showModalIngreso = true;
        this.estadoFormulario = estado;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
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
        this.flagBuscandoIngresos = false;
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

    // Se verifica que el proveedor no esta vacio
    if (!this.proveedorSeleccionado) return this.alertService.info('Debe seleccionar un proveedor');

    this.alertService.loading();

    const data = {
      fechaIngreso: new Date(fechaIngreso),
      nroFactura,
      comentario,
      proveedorId: this.proveedorSeleccionado.id,
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
      proveedorId: this.proveedorSeleccionado.id,
    }

    this.ingresosService.actualizarIngreso(this.ingresoSeleccionado.id, data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarIngresos();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Abrir nuevo proveedor
  abrirNuevoProveedor(): void {
    this.showModalIngreso = false;
    this.showModalProveedor = true;
    this.reiniciarFormularioProveedor();
  }

  // Cerrar nuevo proveedor
  cerrarNuevoProveedor(): void {
    this.showModalProveedor = false;
    this.showModalIngreso = true;
  }

  // Nuevo proveedor
  nuevoProveedor(): void {

    if (this.verificacionDatosProveedor() !== '') return this.alertService.info(this.verificacionDatosProveedor());

    this.alertService.loading();

    const data = {
      ...this.proveedorForm,
      creatorUserId: this.authService.usuario.userId
    }

    this.proveedoresService.nuevoProveedor(data).subscribe({
      next: ({ proveedor }) => {
        this.proveedorSeleccionado = proveedor;
        this.proveedores.push(proveedor);
        this.showModalProveedor = false;
        this.showModalIngreso = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Verificacion de datos
  verificacionDatosProveedor(): string {
    const { descripcion, identificacion } = this.proveedorForm;
    let msg = '';
    if (descripcion.trim() === '') msg = 'Debe colocar un Nombre o Razon Social';
    else if (identificacion.trim() === '') msg = 'Debe colocar una identificación';
    return msg;
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

  seleccionarProveedor(proveedor: any): void {
    this.proveedorSeleccionado = proveedor;
    this.showBuscadorProveedores = false;
  }

  cancelarProveedor(): void {
    this.proveedorSeleccionado = null;
    this.filtroProveedor.parametro = '';
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.ingresoForm = {
      fechaIngreso: format(new Date(), 'yyyy-MM-dd'),
      nroFactura: '',
      comentario: '',
    }
  }

  // Reiniciando formulario proveedor
  reiniciarFormularioProveedor(): void {
    this.proveedorForm = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      telefono: '',
      domicilio: '',
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
