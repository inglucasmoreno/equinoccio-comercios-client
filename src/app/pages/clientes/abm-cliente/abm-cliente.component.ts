import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ClientesService } from '../../../services/clientes.service';

@Component({
  standalone: true,
  selector: 'app-abm-cliente',
  templateUrl: './abm-cliente.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export class AbmClienteComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    public clientesService: ClientesService,
  ) { }

  ngOnInit() {}

  nuevoCliente(): void {

    // Verificacion
    if(this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();
    const data = {
      ...this.clientesService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }
    this.clientesService.nuevoCliente(data).subscribe({
      next: ({ cliente }) => {
        this.insertEvent.emit(cliente);
        this.clientesService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  actualizarCliente(): void {

    // Verificacion
    if(this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();
    const data = {
      ...this.clientesService.abmForm,
      creatorUserId: this.authService.usuario.userId,
    }

    this.clientesService.actualizarCliente(this.clientesService.clienteSeleccionado.id, data).subscribe({
      next: ({ cliente }) => {
        this.updateEvent.emit(cliente);
        this.clientesService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Verificacion de datos
  verificacionDatos(): string {
    const { descripcion, identificacion } = this.clientesService.abmForm;
    let msg = '';
    if(descripcion.trim() === '') msg = 'Debe colocar un Nombre o Razon Social';
    else if(identificacion.trim() === '') msg = 'Debe colocar una identificación';
    return msg;
  }

  submit(): void {
    if(this.clientesService.estadoAbm === 'crear') this.nuevoCliente();
    else this.actualizarCliente();
  }

}
