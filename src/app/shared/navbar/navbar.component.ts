import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PermisosDirective } from '../../directives/permisos.directive';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, PermisosDirective],
  templateUrl: './navbar.component.html',
  styleUrls: [],
})
export class NavbarComponent implements OnInit {

  public usuarioLogin: any = null;

  // Flags - Mostrar/Ocultar secciones

  public showSeccion = {
    ventas: false,
    productos: false,
    reservas: false,
    cajas: false,
    configuraciones: false,
  }

  // Condiciones - Mostrar/Ocultar secciones

  public condicionShowVentas = this.authService.usuario.permisos.includes('GENERAR_VENTA_ALL') ||
  this.authService.usuario.permisos.includes('GENERAR_VENTA_READ') ||
  this.authService.usuario.permisos.includes('BUSQUEDA_VENTAS_ALL') ||
  this.authService.usuario.permisos.includes('BUSQUEDA_VENTAS_READ') ||
  this.authService.usuario.permisos.includes('VENTAS_ACTIVAS_ALL') ||
  this.authService.usuario.permisos.includes('VENTAS_ACTIVAS_READ') ||
  this.authService.usuario.role === 'ADMIN_ROLE';

  public condicionShowProductos = this.authService.usuario.permisos.includes('LISTADO_PRODUCTOS_ALL') ||
  this.authService.usuario.permisos.includes('LISTADO_PRODUCTOS_READ') ||
  this.authService.usuario.permisos.includes('INGRESOS_ALL') ||
  this.authService.usuario.permisos.includes('INGRESOS_READ') ||
  this.authService.usuario.permisos.includes('PROVEEDORES_ALL') ||
  this.authService.usuario.permisos.includes('PROVEEDORES_READ') ||
  this.authService.usuario.role === 'ADMIN_ROLE';

  public condicionShowReservas = this.authService.usuario.permisos.includes('NUEVA_RESERVA_ALL') ||
  this.authService.usuario.permisos.includes('NUEVA_RESERVA_READ') ||
  this.authService.usuario.permisos.includes('LISTADO_RESERVAS_ALL') ||
  this.authService.usuario.permisos.includes('LISTADO_RESERVAS_READ') ||
  this.authService.usuario.role === 'ADMIN_ROLE';

  public condicionShowCajas = this.authService.usuario.permisos.includes('CIERRE_CAJA_ALL') ||
  this.authService.usuario.permisos.includes('CIERRE_CAJA_READ') ||
  this.authService.usuario.permisos.includes('LISTADO_CAJAS_ALL') ||
  this.authService.usuario.permisos.includes('LISTADO_CAJAS_READ') ||
  this.authService.usuario.role === 'ADMIN_ROLE';

  public condicionShowConfiguraciones = this.authService.usuario.permisos.includes('USUARIOS_ALL') ||
  this.authService.usuario.permisos.includes('USUARIOS_READ') ||
  this.authService.usuario.permisos.includes('UNIDADES_MEDIDA_ALL') ||
  this.authService.usuario.permisos.includes('UNIDADES_MEDIDA_READ') ||
  this.authService.usuario.permisos.includes('TIPOS_INGRESOS_ALL') ||
  this.authService.usuario.permisos.includes('TIPOS_INGRESOS_READ') ||
  this.authService.usuario.permisos.includes('TIPOS_GASTOS_ALL') ||
  this.authService.usuario.permisos.includes('TIPOS_GASTOS_READ') ||
  this.authService.usuario.permisos.includes('BALANZA_ALL') ||
  this.authService.usuario.permisos.includes('BALANZA_READ') ||
  this.authService.usuario.permisos.includes('SUCURSAL_ALL') ||
  this.authService.usuario.permisos.includes('SUCURSAL_READ') ||
  this.authService.usuario.role === 'ADMIN_ROLE'

  constructor(
    public authService: AuthService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    this.usuarioLogin = this.authService.usuario;
  }

  mostrarOcultarSeccion(seccion = 'configuraciones'): void {
    seccion !== 'ventas' ? this.showSeccion.ventas = false : null;
    seccion !== 'productos' ? this.showSeccion.productos = false : null;
    seccion !== 'reservas' ? this.showSeccion.reservas = false : null;
    seccion !== 'cajas' ? this.showSeccion.cajas = false : null;
    seccion !== 'configuraciones' ? this.showSeccion.configuraciones = false : null;
    this.showSeccion[seccion] = !this.showSeccion[seccion];
  }

  // Metodo: Cerrar sesion
  logout(): void { this.authService.logout(); }

}
