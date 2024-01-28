import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { AuthService } from '../../../services/auth.service';
import { CajasService } from '../../../services/cajas.service';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import { Location } from '@angular/common';
import { format } from 'date-fns';

@Component({
  standalone: true,
  selector: 'app-detalles-caja',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    MonedaPipe,
    TarjetaListaComponent,
  ],
  templateUrl: './detalles-caja.component.html',
  styleUrls: []
})
export default class DetallesCajaComponent implements OnInit {

  public caja: any = {};
  public fechaCaja = '';

  // Flags
  public showTotalFacturado = false;
  public showPostnet = false;
  public showIngresos = false;
  public showGastos = false;

  // Ingresos y Gastos
  public ingresos: any[] = [];
  public gastos: any[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private cajasService: CajasService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private location: Location
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Detalles de caja';
    this.alertService.loading();
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {
        this.cajasService.getCaja(id).subscribe({
          next: ({ caja }) => {
            this.caja = caja;
            this.fechaCaja = format(new Date(this.caja?.fechaCaja), 'yyyy-MM-dd');
            this.ingresos = caja.ingresosCajas;
            this.gastos = caja.gastosCajas;
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        });
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarCaja(): void {
    this.alertService.loading();
    this.cajasService.actualizarCaja(this.caja.id, { fechaCaja: this.fechaCaja }).subscribe({
      next: () => {
        this.alertService.success('Caja actualizada correctamente');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Regresar a la pagina anterior
  regresar(): void {
    console.log('llega');
    this.location.back();
  }

}
