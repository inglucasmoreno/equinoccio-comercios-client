import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Subscription, interval } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit {

  // Observable - Consultar reservas
  public TIEMPO_CONSULTA_RESERVA = 60000 * 1;
  public consultarReservasSubscription: Subscription;
  public consultarReservas: any;

  constructor(public dataService: DataService) { }

  ngOnInit(): void {

    this.dataService.obtenerConfigGenerales();

    // Observable -> Monitoreo de reservas por vencer
    this.dataService.alertaReservas();
    this.consultarReservas = interval(this.TIEMPO_CONSULTA_RESERVA);
    this.consultarReservasSubscription = this.consultarReservas.subscribe(() => {
      this.dataService.alertaReservas();
    })

  }

}
