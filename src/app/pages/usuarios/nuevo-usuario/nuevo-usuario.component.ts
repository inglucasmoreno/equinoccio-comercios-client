import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import gsap from 'gsap';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  styleUrls: []
})
export default class NuevoUsuarioComponent implements OnInit {

  get usuario() {
    return this.usuarioForm.get('usuario');
  }

  get apellido() {
    return this.usuarioForm.get('apellido');
  }

  get nombre() {
    return this.usuarioForm.get('nombre');
  }

  get dni() {
    return this.usuarioForm.get('dni');
  }

  get email() {
    return this.usuarioForm.get('email');
  }

  get password() {
    return this.usuarioForm.get('password');
  }

  get repetir() {
    return this.usuarioForm.get('repetir');
  }

  get role() {
    return this.usuarioForm.get('role');
  }

  // Modelo reactivo
  public usuarioForm: FormGroup;

  // Listado de sucursales
  public sucursales: any[] = [];
  public sucursalSeleccionada: any = '';
  public sucursalesAsignadas: any[] = [];

  constructor(private fb: FormBuilder,
    private router: Router,
    private usuariosService: UsuariosService,
    private alertService: AlertService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {

    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Equinoccio - Creando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(4)]],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      repetir: ['', [Validators.required, Validators.minLength(4)]],
      role: ['ADMIN_ROLE', Validators.required],
    });

  }

  // Crear nuevo usuario
  nuevoUsuario(): void {

    const { usuario, role, password, repetir } = this.usuarioForm.value;

    // Se verifica si las contraseñas coinciden
    if (password !== repetir) {
      this.alertService.info('Las contraseñas deben coincidir');
      return;
    }

    // Generar una constante data con usuarioForm sin el campo repetir
    const data = this.usuarioForm.value;
    delete data.repetir;


    if (this.usuarioForm.valid) {
      this.alertService.loading();  // Comienzo de loading
      this.usuariosService.nuevoUsuario(this.usuarioForm.value).subscribe({
        next: () => {
          // if (role === 'ADMIN_ROLE') this.router.navigateByUrl('dashboard/usuarios');
          // else this.router.navigateByUrl('dashboard/usuarios/permisos/' + usuario.id);
          this.router.navigateByUrl('dashboard/usuarios');
          this.alertService.close();  // Finaliza el loading
        }, error: ({ error }) => {
          this.alertService.errorApi(error.message);
        }
      })
    } else {
      this.usuarioForm.markAllAsTouched();
    }

  }

}
