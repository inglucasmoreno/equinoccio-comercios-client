import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { ConfigGeneralesService } from './config-generales.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public ubicacionActual: string = 'Dashboard';   // Statebar - Direccion actual
  public showMenu: Boolean = true;               // Header - Controla la visualizacion de la barra de navegacion

  // Formato de balanza
  public formatoBalanza: string = '';
  public mascaraProducto: string = '';
  public mascaraPeso: string = '';

  constructor(
    private alertService: AlertService,
    private configGeneralesService: ConfigGeneralesService,
  ) { }

  obtenerConfigGenerales(): void {
    this.configGeneralesService.listarConfigGenerales({}).subscribe({
      next: ({ configGeneral }) => {

        let mascaraProducto = '';
        let mascaraPeso = '';

        this.formatoBalanza = configGeneral[0].formatoBalanza;
        for (let i = 0; i < this.formatoBalanza.length; i++) {

          // Mascara de producto
          if (this.formatoBalanza[i] === 'p') mascaraProducto += 'y';
          else mascaraProducto += 'n';

          // Mascara de peso
          if (this.formatoBalanza[i] === 'e') mascaraPeso += 'y';
          else mascaraPeso += 'n';

        }
        this.mascaraProducto = mascaraProducto;
        this.mascaraPeso = mascaraPeso;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

}
