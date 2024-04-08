import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroProveedoresPipe } from '../../pipes/filtro-proveedores.pipe';
import { ProveedoresService } from '../../services/proveedores.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import AbmProveedorComponent from './abm-proveedor/abm-proveedor.component';
import { PermisosDirective } from '../../directives/permisos.directive';

@Component({
  standalone: true,
  selector: 'app-proveedores',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroProveedoresPipe,
    AbmProveedorComponent,
    PermisosDirective
  ],
  templateUrl: './proveedores.component.html',
  styleUrls: []
})
export default class ProveedoresComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['PROVEEDORES_ALL'];

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
    public proveedoresService: ProveedoresService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Proveedores';
    this.alertService.loading();
    this.listarProveedores();
  }

  // Listar proveedores
  listarProveedores(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.proveedoresService.listarProveedores(parametros).subscribe({
      next: ({ proveedores }) => {
        this.proveedoresService.proveedores = proveedores;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo proveedor
  nuevoProveedor(proveedor): void {
    this.proveedoresService.proveedores = [proveedor, ...this.proveedoresService.proveedores];
    this.alertService.close();
  }

  // Actualizar proveedor
  actualizarProveedor(proveedor): void {
    const index = this.proveedoresService.proveedores.findIndex((t: any) => t.id === proveedor.id);
    this.proveedoresService.proveedores[index] = proveedor;
    this.proveedoresService.proveedores = [...this.proveedoresService.proveedores];
    this.alertService.close();
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(proveedor: any): void {

    const { id, activo } = proveedor;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.proveedoresService.actualizarProveedor(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarProveedores();
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
    this.listarProveedores();
  }

}
