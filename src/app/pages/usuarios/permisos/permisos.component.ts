import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AlertService } from '../../../services/alert.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { UsuariosPermisosService } from '../../../services/usuarios-permisos.service';
import gsap from 'gsap';

@Component({
  standalone: true,
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ]
})
export default class PermisosComponent implements OnInit {

  // Usuario
  public usuario: any = null;
  public permisos = {

    // Ventas
    GENERAR_VENTA: 'GENERAR_VENTA_NONE',
    VENTAS_ACTIVAS: 'VENTAS_ACTIVAS_NONE',
    BUSQUEDA_VENTAS: 'BUSQUEDA_VENTAS_NONE',
    CLIENTES: 'CLIENTES_NONE',

    // Productos
    LISTADO_PRODUCTOS: 'LISTADO_PRODUCTOS_NONE',
    INGRESOS: 'INGRESOS_NONE',
    PROVEEDORES: 'PROVEEDORES_NONE',

    // Reservas
    NUEVA_RESERVA: 'NUEVA_RESERVA_NONE',
    LISTADO_RESERVAS: 'LISTADO_RESERVAS_NONE',

    // Cajas
    CIERRE_CAJA: 'CIERRE_CAJA_NONE',
    LISTADO_CAJAS: 'LISTADO_CAJAS_NONE',

    // Configuraciones
    USUARIOS: 'USUARIOS_NONE',
    UNIDADES_MEDIDA: 'UNIDADES_MEDIDA_NONE',
    TIPOS_INGRESOS: 'TIPOS_INGRESOS_NONE',
    TIPOS_GASTOS: 'TIPOS_GASTOS_NONE',
    BALANZA: 'BALANZA_NONE',
    SUCURSAL: 'SUCURSAL_NONE',

  }

  // Flags
  public showVentas = false;
  public showProductos = false;
  public showReservas = false;
  public showCajas = false;
  public showConfiguraciones = false;

  constructor(
    private dataService: DataService,
    private alertService: AlertService,
    private usuariosService: UsuariosService,
    private activatedRoute: ActivatedRoute,
    private usuariosPermisosService: UsuariosPermisosService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Equinoccio - Permisos de usuario';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.activatedRoute.params.subscribe(({ id }) => {
      this.getUsuario(id);
    })
  }

  getUsuario(id: any): void {
    this.alertService.loading();
    this.usuariosService.getUsuario(id).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.adaptarPermisosEntrada();
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  cambiarEstadoSeccion(seccion: string): void {
    switch (seccion) {
      case 'ventas':
        this.showVentas = !this.showVentas;
        break;
      case 'productos':
        this.showProductos = !this.showProductos;
        break;
      case 'reservas':
        this.showReservas = !this.showReservas;
        break;
      case 'cajas':
        this.showCajas = !this.showCajas;
        break;
      case 'configuraciones':
        this.showConfiguraciones = !this.showConfiguraciones;
        break;
    }
  }

  actualizarPermiso(seccion: string): void {

    this.alertService.loading();

    // Se busca el id del permiso en usuariosPermisos
    const permisoSeleccionado = this.usuario.usuariosPermisos.find(item => item.seccion === seccion);

    if(permisoSeleccionado){ // El permiso existe
      this.usuariosPermisosService.actualizarPermiso(permisoSeleccionado.id, { permiso: this.permisos[seccion] }).subscribe({
        next: () => {
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)

      });
    }else{  // El permiso no existe
      this.usuariosPermisosService.nuevoPermiso({
        usuarioId: this.usuario.id,
        permiso: this.permisos[seccion],
        seccion: seccion,
      }).subscribe({
        next: ({ permiso }) => {
          this.usuario.usuariosPermisos.push(permiso);
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }

  }

  adaptarPermisosEntrada(): void {
    this.usuario.usuariosPermisos.map(item => {
      this.permisos[item.seccion] = item.permiso;
    })
  }

}
