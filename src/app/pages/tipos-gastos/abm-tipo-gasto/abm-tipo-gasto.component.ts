import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { TiposGastosService } from '../../../services/tipos-gastos.service';

@Component({
  standalone: true,
  selector: 'app-abm-tipo-gasto',
  templateUrl: './abm-tipo-gasto.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export default class AbmTipoGastoComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    public tiposGastosService: TiposGastosService,
  ) { }

  ngOnInit() {}

  nuevoTipo(): void {

    // Verificacion
    if (this.tiposGastosService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.tiposGastosService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }
    this.tiposGastosService.nuevoTipo(data).subscribe({
      next: ({ tipo }) => {
        this.insertEvent.emit(tipo);
        this.tiposGastosService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarTipo(): void {

    // Verificacion
    if (this.tiposGastosService.abmForm.descripcion === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.tiposGastosService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }

    this.tiposGastosService.actualizarTipo(this.tiposGastosService.tipoSeleccionado.id, data).subscribe({
      next: ({ tipo }) => {
        this.updateEvent.emit(tipo);
        this.tiposGastosService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  submit(): void {
    this.tiposGastosService.estadoAbm === 'crear' ? this.nuevoTipo() : this.actualizarTipo();
  }

}
