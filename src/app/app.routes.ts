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

      {
        path: 'productos',
        title: 'Productos',
        loadComponent: () => import('./pages/productos/productos.component'),
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
