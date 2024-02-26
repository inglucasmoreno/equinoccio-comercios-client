import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {

  public usuarioLogin: any = null;

  public showSeccion = {
    ventas: false,
    productos: false,
    reservas: false,
    cajas: false,
    configuraciones: false,
  }

  constructor(
    public authService: AuthService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    this.usuarioLogin = this.authService.usuario;
  }

  mostrarOcultarSeccion(seccion = 'configuraciones'): void {
    this.showSeccion[seccion] = !this.showSeccion[seccion];
  }

  // Metodo: Cerrar sesion
  logout(): void { this.authService.logout(); }

}
