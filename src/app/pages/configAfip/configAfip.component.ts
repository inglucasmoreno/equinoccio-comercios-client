import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { DataService } from '../../services/data.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { ConfigAfipService } from '../../services/config-afip.service';
import gsap from 'gsap';
import { format } from 'date-fns';

@Component({
  standalone: true,
  selector: 'app-configAfip',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
  ],
  templateUrl: './configAfip.component.html',
  styleUrls: []
})
export default class ConfigAfipComponent implements OnInit {

  public showModalConfiguraciones = false;
  public showSeccionConfiguraciones = false;
  public showSeccionDatosFacturacion = false;
  public configuracionesForm = { cert: '', key: '', cuit: '', puntoVenta: '' };
  public configuraciones = {
    id: '',
    cert: '',
    key: '',
    cuit: '',
    puntoVenta: '',
    razonSocial: '',
    iibb: '',
    domicilio: '',
    inicioActividad: '',
  };

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private alertService: AlertService,
    private configAfipService: ConfigAfipService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Configuraciones AFIP';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.alertService.loading();
    this.obtenerConfiguraciones();
  }

  obtenerConfiguraciones(): void {
    this.configAfipService.getConfiguraciones().subscribe({
      next: ({ configuraciones }) => {
        this.configuraciones = configuraciones;
        if (configuraciones) {
          this.configuraciones.cert = decodeURIComponent(configuraciones.cert);
          this.configuraciones.key = decodeURIComponent(configuraciones.key);
          this.configuraciones.cuit = configuraciones.cuit;
          this.configuraciones.puntoVenta = configuraciones.puntoVenta;
          this.configuraciones.razonSocial = configuraciones.razonSocial;
          this.configuraciones.iibb = configuraciones.iibb;
          this.configuraciones.domicilio = configuraciones.domicilio;
          this.configuraciones.inicioActividad = format(configuraciones.inicioActividad, 'yyyy-MM-dd');
        }
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  abrirAgregarConfiguraciones(): void {
    this.showModalConfiguraciones = true;
  }

  agregarConfiguraciones(): void {

    if (!this.configuracionesForm.cert || !this.configuracionesForm.key || !this.configuracionesForm.cuit || !this.configuracionesForm.puntoVenta) {
      return this.alertService.info('Debe completar todos los campos obligatorios');
    }

    this.alertService.loading();

    const dataConfiguraciones = {
      cert: encodeURIComponent(this.configuracionesForm.cert),
      key: encodeURIComponent(this.configuracionesForm.key),
      cuit: this.configuracionesForm.cuit,
      puntoVenta: this.configuracionesForm.puntoVenta,
      creatorUserId: this.authService.usuario.userId
    };

    this.configAfipService.crearConfiguraciones(dataConfiguraciones).subscribe({
      next: ({ configuraciones }) => {
        this.configuraciones = configuraciones;
        this.configuraciones.cert = this.configuracionesForm.cert.trim();
        this.configuraciones.key = this.configuracionesForm.key.trim();
        this.alertService.success('Configuraciones creadas correctamente!');
        this.showModalConfiguraciones = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  actualizarConfiguraciones(): void {

    if (!this.configuraciones.cert || !this.configuraciones.key || !this.configuraciones.cuit || !this.configuraciones.puntoVenta) {
      return this.alertService.info('Debe completar todos los campos obligatorios');
    }

    this.alertService.question({ msg: 'Actualizando configuraciones', buttonText: 'Actualizar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
          this.alertService.loading();
          const dataConfiguracionesActualizacion = {
            cert: encodeURIComponent(this.configuraciones.cert),
            key: encodeURIComponent(this.configuraciones.key),
            cuit: this.configuraciones.cuit,
            razonSocial: this.configuraciones.razonSocial,
            iibb: this.configuraciones.iibb,
            domicilio: this.configuraciones.domicilio,
            inicioActividad: this.configuraciones.inicioActividad,
            puntoVenta: this.configuraciones.puntoVenta,
            creatorUserId: this.authService.usuario.userId
          };
          this.configAfipService.actualizarConfiguraciones(this.configuraciones.id, dataConfiguracionesActualizacion).subscribe({
            next: ({ configuraciones }) => {
              this.configuraciones.cert = decodeURIComponent(configuraciones.cert);
              this.configuraciones.key = decodeURIComponent(configuraciones.key);
              this.configuraciones.cuit = configuraciones.cuit;
              this.configuraciones.puntoVenta = configuraciones.puntoVenta;
              this.configuraciones.razonSocial = configuraciones.razonSocial
              this.configuraciones.iibb = configuraciones.iibb;
              this.configuraciones.domicilio = configuraciones.domicilio;
              this.configuraciones.inicioActividad = format(configuraciones.inicioActividad, 'yyyy-MM-dd');
              this.alertService.success('Configuraciones actualizadas correctamente!');
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });

  }

}
