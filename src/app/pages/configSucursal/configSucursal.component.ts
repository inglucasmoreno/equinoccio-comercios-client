import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AlertService } from '../../services/alert.service';
import { ConfigGeneralesService } from '../../services/config-generales.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-configSucursal',
  templateUrl: './configSucursal.component.html',
  imports: [
    CommonModule,
    FormsModule,
  ],
  styleUrls: []
})
export default class ConfigSucursalComponent implements OnInit {

  // Permisos
  public permiso_escritura = false;

  configGeneral: any = {};

  configGeneralForm: any = {
    nombreEmpresa: '',
    nombreSucursal: '',
    domicilioSucursal: '',
    telefonoSucursal: '',
  };

  // Subida de archivo
  public previsualizacion: string;
  public imagenParaSubir: any;
  public file;

  constructor(
    private authService: AuthService,
    public dataService: DataService,
    private alertService: AlertService,
    private configGeneralesService: ConfigGeneralesService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Equinoccio - Configuración de sucursal';
    this.calcularPermiso();
    this.alertService.loading();
    this.configGeneralesService.listarConfigGenerales({}).subscribe({
      next: ({ configGeneral }) => {
        this.configGeneral = configGeneral[0];
        this.configGeneralForm.nombreEmpresa = configGeneral[0].nombreEmpresa;
        this.configGeneralForm.nombreSucursal = configGeneral[0].nombreSucursal;
        this.configGeneralForm.domicilioSucursal = configGeneral[0].domicilioSucursal;
        this.configGeneralForm.telefonoSucursal = configGeneral[0].telefonoSucursal;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  calcularPermiso(): void {
    this.authService.usuario.permisos.includes('SUCURSAL_ALL') || this.authService.usuario.role === 'ADMIN_ROLE'
      ? this.permiso_escritura = true : this.permiso_escritura = false;
  }

  actualizarConfiguraciones(): void {

    // Verificar si los campos están vacíos
    if (this.configGeneralForm.nombreEmpresa === '') {
      this.alertService.info('El campo de empresa no puede estar vacío');
      return;
    }

    if (this.configGeneralForm.nombreSucursal === '') {
      this.alertService.info('El campo de sucursal no puede estar vacío');
      return;
    }

    this.alertService.loading();
    const dataConfig = {
      nombreEmpresa: this.configGeneralForm.nombreEmpresa,
      nombreSucursal: this.configGeneralForm.nombreSucursal,
      domicilioSucursal: this.configGeneralForm.domicilioSucursal,
      telefonoSucursal: this.configGeneralForm.telefonoSucursal,
    }
    this.configGeneralesService.actualizarConfigGeneral(this.configGeneral.id, dataConfig).subscribe({
      next: ({ configGeneral }) => {
        this.configGeneral = configGeneral;
        this.configGeneralForm.nombreEmpresa = configGeneral.nombreEmpresa;
        this.configGeneralForm.nombreSucursal = configGeneral.nombreSucursal;
        this.configGeneralForm.domicilioSucursal = configGeneral.domicilioSucursal;
        this.configGeneralForm.telefonoSucursal = configGeneral.telefonoSucursal;

        if (this.imagenParaSubir) {
          this.alertService.loading();
          const formData = new FormData();
          formData.append('file', this.imagenParaSubir);
          this.configGeneralesService.actualizarLogoEmpresa(formData).subscribe({
            next: () => {
              this.file = '';
              this.alertService.success('Configuraciones actualizadas correctamente');
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        } else {
          this.alertService.success('Configuraciones actualizadas correctamente');
        }

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Se captura la imagen a subir
  capturarImagen(event: any): void {
    if (event.target.files[0]) { // Se captura si hay imagen seleccionada
      this.imagenParaSubir = event.target.files[0];

      const formato = this.imagenParaSubir.type.split('/')[1];
      const condicion = formato !== 'png' && formato !== 'jpg' && formato !== 'jpeg' && formato !== 'gif';

      if (condicion) {
        this.previsualizacion = '';
        this.file = '';
        return this.alertService.errorApi('El archivo debe ser una imagen');
      }

      this.extraerBase64(this.imagenParaSubir).then((imagen: any) => {
        this.previsualizacion = imagen.base;
      });
    }
  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      return null;
    }
  })

  eliminarImagen(): void {
    this.file = '';
    this.previsualizacion = '';
    this.imagenParaSubir = null;
  }


}
