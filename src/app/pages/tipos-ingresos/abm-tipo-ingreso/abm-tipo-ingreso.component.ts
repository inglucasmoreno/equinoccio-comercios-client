import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { TiposIngresosService } from '../../../services/tipos-ingresos.service';

@Component({
  standalone: true,
  selector: 'app-abm-tipo-ingreso',
  templateUrl: './abm-tipo-ingreso.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export default class AbmTipoIngresoComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    public tiposIngresosService: TiposIngresosService,
  ) { }

  ngOnInit() {}

  nuevoTipo(): void {

    // Verificacion
    if (this.tiposIngresosService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria 2');

    this.alertService.loading();
    const data = {
      ...this.tiposIngresosService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }
    this.tiposIngresosService.nuevoTipo(data).subscribe({
      next: ({ tipo }) => {
        this.insertEvent.emit(tipo);
        this.tiposIngresosService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarTipo(): void {

    // Verificacion
    if (this.tiposIngresosService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.tiposIngresosService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }

    this.tiposIngresosService.actualizarTipo(this.tiposIngresosService.tipoSeleccionado.id, data).subscribe({
      next: ({ tipo }) => {
        this.updateEvent.emit(tipo);
        this.tiposIngresosService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  submit(): void {
    this.tiposIngresosService.estadoAbm === 'crear' ? this.nuevoTipo() : this.actualizarTipo();
  }


}
