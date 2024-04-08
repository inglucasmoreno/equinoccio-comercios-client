import { Component, OnInit } from '@angular/core';
import { Usuarios } from '../../interfaces/Usuarios.interface';
import { UsuariosService } from '../../services/usuarios.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { BotonTablaComponent } from '../../components/boton-tabla/boton-tabla.component';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { FiltroUsuariosPipe } from '../../pipes/filtro-usuarios.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { BotonGenericoComponent } from '../../components/boton-generico/boton-generico.component';
import { AuthService } from '../../services/auth.service';
import { FormBuilder } from '@angular/forms';
import { PermisosDirective } from '../../directives/permisos.directive';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [
    CommonModule,
    TarjetaListaComponent,
    BotonTablaComponent,
    RouterModule,
    PastillaEstadoComponent,
    FiltroUsuariosPipe,
    NgxPaginationModule,
    BotonGenericoComponent,
    PermisosDirective
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: []
})
export default class UsuariosComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['USUARIOS_ALL'];

  // Usuarios
  public usuarios: Usuarios[];
  public total = 0;

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
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'apellido'
  }

  constructor(
    private usuariosService: UsuariosService,
    private alertService: AlertService,
    private dataService: DataService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Usuarios'
    this.alertService.loading();
    this.listarUsuarios();
  }

  // Listar usuarios
  listarUsuarios(): void {
    this.usuariosService.listarUsuarios(
      this.ordenar.direccion,
      this.ordenar.columna
    ).subscribe({
      next: (resp) => {
        const { usuarios, total } = resp;
        this.usuarios = usuarios;
        this.total = total;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(usuario: Usuarios): void {
    const { id, activo } = usuario;
    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.usuariosService.actualizarUsuario(id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarUsuarios();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
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
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarUsuarios();
  }


}
