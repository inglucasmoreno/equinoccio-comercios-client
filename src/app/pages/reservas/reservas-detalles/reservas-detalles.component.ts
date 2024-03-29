import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReservasService } from '../../../services/reservas.service';
import { DataService } from '../../../services/data.service';
import { AlertService } from '../../../services/alert.service';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import { format } from 'date-fns';

@Component({
  standalone: true,
  selector: 'app-reservas-detalles',
  templateUrl: './reservas-detalles.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    MonedaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export default class ReservasDetallesComponent implements OnInit {

  // Flag
  public showActualizarUsuarioGenerador: boolean = false;
  public showActualizarObservaciones: boolean = false;

  public fechaReserva: string = '';
  public fechaEntrega: string = '';
  public horaEntrega: string = '';
  public reserva: any = null;

  public usuarioGenerador: string = '';
  public observaciones: string = '';

  constructor(
    private reservasService: ReservasService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Detalles de reserva';
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({ id }) => {
      this.obtenerReserva(id);
    })
  }

  obtenerReserva(id: any): void {
    this.reservasService.getReserva(id).subscribe({
      next: ({ reserva }) => {
        this.fechaReserva = format(reserva.fechaReserva, 'yyyy-MM-dd');
        this.fechaEntrega = format(reserva.fechaEntrega, 'yyyy-MM-dd');
        this.horaEntrega = reserva.horaEntrega;
        this.reserva = reserva;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message)
      }
    })
  }

  actualizarFechaReserva(): void {

    if(!this.fechaReserva){
      this.alertService.info('Debe colocar una fecha de reserva vàlida');
      return;
    }

    this.alertService.loading();

    this.reservasService.actualizarReserva(this.reserva.id, { fechaReserva: this.fechaReserva }).subscribe({
      next: () => {
        this.alertService.success('Fecha de reserva actualizada!');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  abrirActualizarUsuarioGenerador(): void {
    this.showActualizarUsuarioGenerador = true;
    this.usuarioGenerador = this.reserva.usuarioCreador;
  }

  abrirActualizarObservaciones(): void {
    this.showActualizarObservaciones = true;
    this.observaciones = this.reserva.observaciones;
  }

  actualizarUsuarioGenerador(): void {
      
      if(this.usuarioGenerador === ''){
        this.alertService.info('Debe colocar un usuario generador');
        return;
      }
  
      this.alertService.loading();
  
      this.reservasService.actualizarReserva(this.reserva.id, { usuarioCreador: this.usuarioGenerador }).subscribe({
        next: ({ reserva }) => {
          this.alertService.success('Usuario generador actualizado!');
          this.reserva.usuarioCreador = reserva.usuarioCreador;
          this.showActualizarUsuarioGenerador = false;
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
  }

  actualizarObservaciones(): void {
      
    this.alertService.loading();

    this.reservasService.actualizarReserva(this.reserva.id, { observaciones: this.observaciones }).subscribe({
      next: ({ reserva }) => {
        this.alertService.success('Observaciones actualizadas!');
        this.reserva.observaciones = reserva.observaciones;
        this.showActualizarObservaciones = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
}

}
