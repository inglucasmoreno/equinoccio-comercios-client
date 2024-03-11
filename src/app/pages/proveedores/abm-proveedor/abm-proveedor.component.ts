import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroProveedoresPipe } from '../../../pipes/filtro-proveedores.pipe';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ProveedoresService } from '../../../services/proveedores.service';

@Component({
  standalone: true,
  selector: 'app-abm-proveedor',
  templateUrl: './abm-proveedor.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroProveedoresPipe
  ]
})
export default class AbmProveedorComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    public proveedoresService: ProveedoresService,
  ) { }

  ngOnInit() { }

  nuevoProveedor(): void {

    // Verificacion
    if (this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();
    const data = {
      ...this.proveedoresService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }
    this.proveedoresService.nuevoProveedor(data).subscribe({
      next: ({ proveedor }) => {
        this.insertEvent.emit(proveedor);
        this.proveedoresService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  actualizarProveedor(): void {

    // Verificacion
    if (this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();
    const data = {
      ...this.proveedoresService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }

    this.proveedoresService.actualizarProveedor(this.proveedoresService.proveedorSeleccionado.id, data).subscribe({
      next: ({ proveedor }) => {
        this.updateEvent.emit(proveedor);
        this.proveedoresService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Verificacion de datos
  verificacionDatos(): string {
    const { descripcion, identificacion } = this.proveedoresService.abmForm;
    let msg = '';
    if (descripcion.trim() === '') msg = 'Debe colocar un Nombre o Razon Social';
    else if (identificacion.trim() === '') msg = 'Debe colocar una identificación';
    return msg;
  }

  submit(): void {
    this.proveedoresService.estadoAbm === 'crear' ? this.nuevoProveedor() : this.actualizarProveedor();
  }

}
