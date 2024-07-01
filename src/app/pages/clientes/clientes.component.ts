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
import { AbmClienteComponent } from './abm-cliente/abm-cliente.component';
import { PermisosDirective } from '../../directives/permisos.directive';

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
    FiltroClientesPipe,
    AbmClienteComponent,
    PermisosDirective
  ],
  styleUrls: []
})
export default class ClientesComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['CLIENTES_ALL'];

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
    public clientesService: ClientesService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Equinoccio - Clientes';
    this.alertService.loading();
    this.listarClientes();
  }

  // Listar clientes
  listarClientes(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.clientesService.listarClientes(parametros).subscribe({
      next: ({ clientes }) => {
        this.clientesService.clientes = clientes;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo cliente
  nuevoCliente(cliente): void {
    this.clientesService.clientes = [cliente, ...this.clientesService.clientes];
    this.alertService.close();
  }

  actualizarCliente(cliente): void {
    const index = this.clientesService.clientes.findIndex((t: any) => t.id === cliente.id);
    this.clientesService.clientes[index] = cliente;
    this.clientesService.clientes = [...this.clientesService.clientes];
    this.alertService.close();
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(cliente: any): void {

    const { id, activo } = cliente;

    this.alertService.question({ msg: cliente.activo ? 'Baja de elemento' : 'Alta de elemento', buttonText: cliente.activo ? 'Dar de baja' : 'Dar de alta' })
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
