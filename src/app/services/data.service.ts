import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { ConfigGeneralesService } from './config-generales.service';
import { ReservasService } from './reservas.service';

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

  // Alerta de reservas
  public showAlertaReserva: Boolean = false;
  public showAlertaReservaBarra: Boolean = false;
  public cantidadReservasPorVencer: number = 0;
  public audioReserva = new Audio();

  constructor(
    private alertService: AlertService,
    private reservasService: ReservasService,
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

  // Consultar reservas por vencer
  alertaReservas(): void {
    this.reservasService.reservasPorVencer().subscribe({
      next: ({ reservas }) => {
        if (reservas.length > 0) {
          this.cantidadReservasPorVencer = reservas.length;
          this.showAlertaReserva = true;
          this.showAlertaReservaBarra = true;
          this.sonidoReserva();
        } else {
          this.showAlertaReserva = false;
          this.showAlertaReservaBarra = false;
        }
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Sonido - Alerta -> Reserva por vencer
  sonidoReserva(): void {
    this.audioReserva.src = "assets/sounds/Alert-Reserva.wav";
    this.audioReserva.load();
    this.audioReserva.play();
  }

  cerrarAlertaReservas(): void {
    this.showAlertaReserva = false;
  }

}
