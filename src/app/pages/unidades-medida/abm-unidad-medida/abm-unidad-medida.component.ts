import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { UnidadesMedidaService } from '../../../services/unidades-medida.service';

@Component({
  standalone: true,
  selector: 'app-abm-unidad-medida',
  templateUrl: './abm-unidad-medida.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export default class AbmUnidadMedidaComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  public abmForm = {
    descripcion: '',
  }

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    public unidadesMedidaService: UnidadesMedidaService,
  ) { }

  ngOnInit() {}

  nuevaUnidad(): void {

    // Verificacion
    if (this.unidadesMedidaService.abmForm.descripcion.trim() === '') return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.unidadesMedidaService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }
    this.unidadesMedidaService.nuevaUnidad(data).subscribe({
      next: ({ unidad }) => {
        this.insertEvent.emit(unidad);
        this.unidadesMedidaService.showModalAbm = false;
        this.reiniciarForm();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarUnidad(): void {

    // Verificacion
    if (this.unidadesMedidaService.abmForm.descripcion.trim() === '')  return this.alertService.info('La descripción es obligatoria');

    this.alertService.loading();
    const data = {
      ...this.unidadesMedidaService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }

    this.unidadesMedidaService.actualizarUnidad(this.unidadesMedidaService.unidadMedidaSeleccionada.id, data).subscribe({
      next: ({ unidad }) => {
        this.updateEvent.emit(unidad);
        this.unidadesMedidaService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  reiniciarForm(): void {
    this.abmForm = {
      descripcion: '',
    }
  }

  submit(): void {
    this.unidadesMedidaService.estadoAbm === 'crear' ? this.nuevaUnidad() : this.actualizarUnidad();
  }

}
