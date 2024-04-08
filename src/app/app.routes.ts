import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  // Default
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },

  // Login
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./auth/login/login.component'),
  },

  // Inicializacion
  {
    path: 'init',
    title: 'Inicializacion',
    loadComponent: () => import('./inicializacion/inicializacion.component'),
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/pages.component'),
    canActivate: [AuthGuard],
    children: [

      // Home
      {
        path: 'home',
        title: 'Inicio',
        loadComponent: () => import('./pages/home/home.component'),
      },

      // Venta
      {
        path: 'ventas',
        title: 'Generando venta',
        loadComponent: () => import('./pages/ventas/ventas.component'),
      },

      // Ventas - Activas
      {
        path: 'ventas-activas',
        title: 'Ventas activas',
        loadComponent: () => import('./pages/ventas/ventas-activas/ventas-activas.component'),
      },

      // Ventas - Cajas
      {
        path: 'ventas-caja/:idCaja',
        title: 'Ventas caja',
        loadComponent: () => import('./pages/ventas/ventas-caja/ventas-caja.component'),
      },

      // Ventas - Busqueda
      {
        path: 'ventas-busqueda',
        title: 'Busqueda de ventas',
        loadComponent: () => import('./pages/ventas/ventas-busqueda/ventas-busqueda.component'),
      },

      // Perfil
      {
        path: 'perfil',
        title: 'Perfil',
        loadComponent: () => import('./pages/perfil/perfil.component'),
      },

      // Usuarios

      {
        path: 'usuarios',
        title: 'Usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component'),
      },

      {
        path: 'usuarios/nuevo',
        title: 'Nuevo usuario',
        loadComponent: () => import('./pages/usuarios/nuevo-usuario/nuevo-usuario.component'),
      },

      {
        path: 'usuarios/editar/:id',
        title: 'Editar usuario',
        loadComponent: () => import('./pages/usuarios/editar-usuario/editar-usuario.component'),
      },

      {
        path: 'usuarios/password/:id',
        title: 'Editar password',
        loadComponent: () => import('./pages/usuarios/editar-password/editar-password.component'),
      },

      {
        path: 'usuarios/permisos/:id',
        title: 'Permisos de usuario',
        loadComponent: () => import('./pages/usuarios/permisos/permisos.component'),
      },

      // Unidades de medida

      {
        path: 'unidades-medida',
        title: 'Unidades de medida',
        loadComponent: () => import('./pages/unidades-medida/unidades-medida.component'),
      },

      // Marcas

      {
        path: 'marcas',
        title: 'Marcas',
        loadComponent: () => import('./pages/marcas/marcas.component'),
      },

      // Productos

      // Listado de productos
      {
        path: 'productos',
        title: 'Productos',
        loadComponent: () => import('./pages/productos/productos.component'),
      },

      // Ingresos
      {
        path: 'ingresos',
        title: 'Ingresos',
        loadComponent: () => import('./pages/ingresos/ingresos.component'),
      },

      // Detalles - Ingreso
      {
        path: 'ingresos/detalles/:id',
        title: 'Detalles de ingreso',
        loadComponent: () => import('./pages/ingresos/detalles-ingreso/detalles-ingreso.component'),
      },

      // Cajas

      // Cierre de caja
      {
        path: 'cajas',
        title: 'Cierre de caja',
        loadComponent: () => import('./pages/cierre-caja/cierre-caja.component'),
      },

      // Detalles de caja
      {
        path: 'cajas-detalles/:id',
        title: 'Detalles de caja',
        loadComponent: () => import('./pages/cierre-caja/detalles-caja/detalles-caja.component'),
      },

      // Listado de cajas
      {
        path: 'listado-cajas',
        title: 'Listado de cajas',
        loadComponent: () => import('./pages/cierre-caja/cajas/cajas.component'),
      },

      // Tipos de ingresos
      {
        path: 'tipos-ingresos',
        title: 'Tipos de ingresos',
        loadComponent: () => import('./pages/tipos-ingresos/tipos-ingresos.component'),
      },

      // Tipos de gastos
      {
        path: 'tipos-gastos',
        title: 'Tipos de gastos',
        loadComponent: () => import('./pages/tipos-gastos/tipos-gastos.component'),
      },

      // Clientes
      {
        path: 'clientes',
        title: 'Clientes',
        loadComponent: () => import('./pages/clientes/clientes.component'),
      },

      // Proveedores
      {
        path: 'proveedores',
        title: 'Proveedores',
        loadComponent: () => import('./pages/proveedores/proveedores.component'),
      },

      // Configuración de balanza
      {
        path: 'config-balanza',
        title: 'Configuración de balanza',
        loadComponent: () => import('./pages/configBalanza/configBalanza.component'),
      },

      // Reservas
      {
        path: 'nueva-reserva',
        title: 'Nueva reserva',
        loadComponent: () => import('./pages/reservas/reservas-nueva/reservas-nueva.component'),
      },
      {
        path: 'detalles-reserva/:id',
        title: 'Detalles de reserva',
        loadComponent: () => import('./pages/reservas/reservas-detalles/reservas-detalles.component'),
      },
      {
        path: 'reservas',
        title: 'Listado de reservas',
        loadComponent: () => import('./pages/reservas/reservas.component'),
      },

    ]
  },

  // Error Page
  {
    path: '**',
    title: 'Error',
    loadComponent: () => import('./error-page/error-page.component'),
  },

];
