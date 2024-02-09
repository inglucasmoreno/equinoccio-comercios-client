import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { AlertService } from '../../services/alert.service';
import { ClientesService } from '../../services/clientes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroClientesPipe } from '../../pipes/filtro-clientes.pipe';

@Component({
  standalone: true,
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroClientesPipe
  ],
  styleUrls: []
})
export default class ClientesComponent implements OnInit {

  // Modal
  public showModalCliente = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Cliente
  public idCliente: string = '';
  public clientes: any = [];
  public clienteSeleccionado: any;

  public clienteForm = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    telefono: '',
    domicilio: '',
  }

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
    private clientesService: ClientesService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Clientes';
    this.alertService.loading();
    this.listarClientes();
  }

  // Abrir modal
  abrirModal(estado: string, cliente: any = null): void {
    this.reiniciarFormulario();
    this.idCliente = '';
    if (estado === 'editar') this.getCliente(cliente);
    else this.showModalCliente = true;
    this.estadoFormulario = estado;
  }

  // Traer datos de cliente
  getCliente(cliente: any): void {
    this.alertService.loading();
    this.idCliente = cliente.id;
    this.clienteSeleccionado = cliente;
    this.clientesService.getCliente(cliente.id).subscribe({
      next: ({ cliente }) => {
        this.clienteForm = {
          descripcion: cliente.descripcion,
          tipo_identificacion: cliente.tipo_identificacion,
          identificacion: cliente.identificacion,
          telefono: cliente.telefono,
          domicilio: cliente.domicilio,
        };
        this.alertService.close();
        this.showModalCliente = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar clientes
  listarClientes(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.clientesService.listarClientes(parametros).subscribe({
      next: ({ clientes }) => {
        this.clientes = clientes;
        this.showModalCliente = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo cliente
  nuevoCliente(): void {

    if(this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();

    const data = {
      ...this.clienteForm,
      creatorUserId: this.authService.usuario.userId
    }

    this.clientesService.nuevoCliente(data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarClientes();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar cliente
  actualizarCliente(): void {

    if(this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();

    this.clientesService.actualizarCliente(this.clienteSeleccionado.id, this.clienteForm).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarClientes();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(cliente: any): void {

    const { id, activo } = cliente;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.clientesService.actualizarCliente(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarClientes();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Verificacion de datos
  verificacionDatos(): string {
    const { descripcion, identificacion } = this.clienteForm;
    let msg = '';
    if(descripcion.trim() === '') msg = 'Debe colocar un Nombre o Razon Social';
    else if(identificacion.trim() === '') msg = 'Debe colocar una identificación';
    return msg;
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.clienteForm = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      telefono: '',
      domicilio: '',
    }
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
    this.listarClientes();
  }

}
