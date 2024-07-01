import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { MonedaPipe } from '../../pipes/moneda.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { ConfigGeneralesService } from '../../services/config-generales.service';
import { PermisosDirective } from '../../directives/permisos.directive';
import gsap from 'gsap';

@Component({
  standalone: true,
  selector: 'app-configBalanza',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    MonedaPipe,
    ModalComponent,
    PermisosDirective
  ],
  templateUrl: './configBalanza.component.html',
  styleUrls: []
})
export default class ConfigBalanzaComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['BALANZA_ALL'];

  public showModalAyuda = false;
  public arregloFormato = [];
  public nuevoFormato = '';
  public formatoActual = null;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private alertService: AlertService,
    private configGeneralesService: ConfigGeneralesService,
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Equinoccio - Configuración de balanza';
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.obtenerCodigo();
  }

  generacionFormato(formato: string): void {
    this.arregloFormato = [];

    // Recorrer los caracteres del formato
    for (let i = 0; i < formato.length; i++) {
      if (formato[i] == 'i') this.arregloFormato.push('di');
      else if (formato[i] == 'i') this.arregloFormato.push('di');
      else if (formato[i] == 'p') this.arregloFormato.push('Pr');
      else if (formato[i] == 'e') this.arregloFormato.push('Pe');
      else if (formato[i] == 'f') this.arregloFormato.push('df');
    }

  }

  obtenerCodigo(): void {
    this.alertService.loading();
    this.configGeneralesService.listarConfigGenerales({}).subscribe({
      next: ({ configGeneral }) => {
        this.formatoActual = configGeneral[0];
        this.generacionFormato(configGeneral[0].formatoBalanza);
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarFormato(): void {

    // Verificacion de string vacio
    if (this.nuevoFormato.trim() === '') {
      this.alertService.info('El formato no puede estar vacio');
      return;
    }

    // Verificacion de formato de codigo
    if (this.verificacionCodigo()) {
      this.alertService.info('El formato de código no es valido');
      return;
    }

    this.alertService.question({ msg: 'Actualizando formato de balanza', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          console.log(this.nuevoFormato);
          this.configGeneralesService.actualizarConfigGeneral(this.formatoActual.id, { formatoBalanza: this.nuevoFormato }).subscribe({
            next: ({ configGeneral }) => {
              console.log(configGeneral);
              this.nuevoFormato = '';
              this.formatoActual.formatoBalanza = configGeneral.formatoBalanza;
              this.generacionFormato(configGeneral.formatoBalanza);
              this.dataService.obtenerConfigGenerales();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  verificacionCodigo(): boolean {
    let errorCodigo = false;
    for (let i = 0; i < this.nuevoFormato.length; i++) {
      if (this.nuevoFormato[i] !== 'i' && this.nuevoFormato[i] !== 'p' && this.nuevoFormato[i] !== 'e' && this.nuevoFormato[i] !== 'f') {
        errorCodigo = true;
        break;
      }
    }
    return errorCodigo;
  }

}
