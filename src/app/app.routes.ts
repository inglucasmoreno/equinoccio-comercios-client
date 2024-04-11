import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NavigationGuard } from './guards/navigation.guard';

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
        data: { permisos: ['GENERAR_VENTA_ALL', 'GENERAR_VENTA_READ'] },
        canActivate: [NavigationGuard],
        title: 'Generando venta',
        loadComponent: () => import('./pages/ventas/ventas.component'),
      },

      // Ventas - Activas
      {
        path: 'ventas-activas',
        data: { permisos: ['VENTAS_ACTIVAS_ALL', 'VENTAS_ACTIVAS_READ'] },
        canActivate: [NavigationGuard],
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
        data: { permisos: ['BUSQUEDA_VENTAS_ALL', 'BUSQUEDA_VENTAS_READ'] },
        canActivate: [NavigationGuard],
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
        data: { permisos: ['USUARIOS_ALL', 'USUARIOS_READ'] },
        canActivate: [NavigationGuard],
        title: 'Usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component'),
      },

      {
        path: 'usuarios/nuevo',
        data: { permisos: ['USUARIOS_ALL'] },
        canActivate: [NavigationGuard],
        title: 'Nuevo usuario',
        loadComponent: () => import('./pages/usuarios/nuevo-usuario/nuevo-usuario.component'),
      },

      {
        path: 'usuarios/editar/:id',
        data: { permisos: ['USUARIOS_ALL'] },
        canActivate: [NavigationGuard],
        title: 'Editar usuario',
        loadComponent: () => import('./pages/usuarios/editar-usuario/editar-usuario.component'),
      },

      {
        path: 'usuarios/password/:id',
        data: { permisos: ['USUARIOS_ALL'] },
        canActivate: [NavigationGuard],
        title: 'Editar password',
        loadComponent: () => import('./pages/usuarios/editar-password/editar-password.component'),
      },

      {
        path: 'usuarios/permisos/:id',
        data: { permisos: ['USUARIOS_ALL'] },
        canActivate: [NavigationGuard],
        title: 'Permisos de usuario',
        loadComponent: () => import('./pages/usuarios/permisos/permisos.component'),
      },

      // Unidades de medida

      {
        path: 'unidades-medida',
        data: { permisos: ['USUARIOS_ALL', 'USUARIOS_READ'] },
        canActivate: [NavigationGuard],
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
        data: { permisos: ['LISTADO_PRODUCTOS_ALL', 'LISTADO_PRODUCTOS_READ'] },
        canActivate: [NavigationGuard],
        title: 'Productos',
        loadComponent: () => import('./pages/productos/productos.component'),
      },

      // Ingresos
      {
        path: 'ingresos',
        data: { permisos: ['INGRESOS_ALL', 'INGRESOS_READ'] },
        canActivate: [NavigationGuard],
        title: 'Ingresos',
        loadComponent: () => import('./pages/ingresos/ingresos.component'),
      },

      // Detalles - Ingreso
      {
        path: 'ingresos/detalles/:id',
        data: { permisos: ['INGRESOS_ALL', 'INGRESOS_READ'] },
        canActivate: [NavigationGuard],
        title: 'Detalles de ingreso',
        loadComponent: () => import('./pages/ingresos/detalles-ingreso/detalles-ingreso.component'),
      },

      // Cajas

      // Cierre de caja
      {
        path: 'cajas',
        data: { permisos: ['CIERRE_CAJA_ALL', 'CIERRE_CAJA_READ'] },
        canActivate: [NavigationGuard],
        title: 'Cierre de caja',
        loadComponent: () => import('./pages/cierre-caja/cierre-caja.component'),
      },

      // Detalles de caja
      {
        path: 'cajas-detalles/:id',
        data: { permisos: ['CIERRE_CAJA_ALL', 'CIERRE_CAJA_READ'] },
        canActivate: [NavigationGuard],
        title: 'Detalles de caja',
        loadComponent: () => import('./pages/cierre-caja/detalles-caja/detalles-caja.component'),
      },

      // Listado de cajas
      {
        path: 'listado-cajas',
        data: { permisos: ['LISTADO_CAJAS_ALL', 'LISTADO_CAJAS_READ'] },
        canActivate: [NavigationGuard],
        title: 'Listado de cajas',
        loadComponent: () => import('./pages/cierre-caja/cajas/cajas.component'),
      },

      // Tipos de ingresos
      {
        path: 'tipos-ingresos',
        data: { permisos: ['TIPOS_INGRESOS_ALL', 'TIPOS_INGRESOS_READ'] },
        canActivate: [NavigationGuard],
        title: 'Tipos de ingresos',
        loadComponent: () => import('./pages/tipos-ingresos/tipos-ingresos.component'),
      },

      // Tipos de gastos
      {
        path: 'tipos-gastos',
        data: { permisos: ['TIPOS_GASTOS_ALL', 'TIPOS_GASTOS_READ'] },
        canActivate: [NavigationGuard],
        title: 'Tipos de gastos',
        loadComponent: () => import('./pages/tipos-gastos/tipos-gastos.component'),
      },

      // Clientes
      {
        path: 'clientes',
        data: { permisos: ['CLIENTES_ALL', 'CLIENTES_READ'] },
        canActivate: [NavigationGuard],
        title: 'Clientes',
        loadComponent: () => import('./pages/clientes/clientes.component'),
      },

      // Proveedores
      {
        path: 'proveedores',
        data: { permisos: ['PROVEEDORES_ALL', 'PROVEEDORES_READ'] },
        canActivate: [NavigationGuard],
        title: 'Proveedores',
        loadComponent: () => import('./pages/proveedores/proveedores.component'),
      },

      // Configuración de balanza
      {
        path: 'config-balanza',
        data: { permisos: ['BALANZA_ALL', 'BALANZA_READ'] },
        canActivate: [NavigationGuard],
        title: 'Configuración de balanza',
        loadComponent: () => import('./pages/configBalanza/configBalanza.component'),
      },

      // Reservas
      {
        path: 'nueva-reserva',
        data: { permisos: ['NUEVA_RESERVA_ALL', 'NUEVA_RESERVA_READ'] },
        canActivate: [NavigationGuard],
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
        data: { permisos: ['LISTADO_RESERVAS_ALL', 'LISTADO_RESERVAS_READ'] },
        canActivate: [NavigationGuard],
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
