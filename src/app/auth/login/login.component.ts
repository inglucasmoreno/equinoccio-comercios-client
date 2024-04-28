import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';
import { ConfigGeneralesService } from '../../services/config-generales.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: []
})
export default class LoginComponent implements OnInit {

  public configGeneral = {
    nombreEmpresa: '',
    nombreSucursal: '',
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  public loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  })

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private configGeneralesService: ConfigGeneralesService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.cargaInicial();
  }

  cargaInicial(): void {
    this.alertService.loading();
    this.configGeneralesService.listarConfigGenerales({}).subscribe({
      next: ({ configGeneral }) => {
        if(configGeneral.length > 0) this.configGeneral = configGeneral[0];
        this.alertService.close();
      }, error: (error) => this.alertService.errorApi(error.message)
    })
  }

  login(): void {
    if(this.loginForm.valid){
      this.alertService.loading();
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.alertService.close();
          this.router.navigateByUrl('/dashboard/home');
        }, error: ({ error }) => {
          this.loginForm.reset();
          this.alertService.errorApi(error.message);
        }
      });
    }else{
      this.loginForm.markAllAsTouched();
    }
  }

}
