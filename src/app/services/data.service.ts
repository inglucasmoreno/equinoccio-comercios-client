import { Injectable } from '@angular/core';
import { ConfigBalanzaService } from './config-balanza.service';
import { AlertService } from './alert.service';

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
    private configBalanzaService: ConfigBalanzaService,
  ) { }

  obtenerFormatoBalanza(): void {
    this.configBalanzaService.listarConfigBalanza({}).subscribe({
      next: ({ configBalanza }) => {

        let mascaraProducto = '';
        let mascaraPeso = '';

        this.formatoBalanza = configBalanza[0].formato;
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
