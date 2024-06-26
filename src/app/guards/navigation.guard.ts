import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate( // Detecta la entrada a una ruta
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.verificarPermisos(route);
  }

  // Se verifica si el usuario esta autorizado para ingresar a la ruta
  verificarPermisos(route: any): boolean {

    const { permisos = [], role } = this.authService.usuario;

    // Si el permisos contiene alguna elemento del arreglo permisos o es ADMIN_ROLE puede ingresar
    if (permisos.some(permiso => route.data.permisos.includes(permiso)) || role === 'ADMIN_ROLE') {
      return true;
    } else {
      this.router.navigateByUrl('/dashboard/home');
      return false;
    }

    // if(permisos.includes(route.data.permisos) || role === 'ADMIN_ROLE'){ // Si tiene permiso o es ADMIN puede ingresar
    //   return true;
    // }else{
    //   this.router.navigateByUrl('/dashboard/home');
    //   return false;
    // }

  }

}
