import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import { ClientesService } from '../../../services/clientes.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
  ],
  selector: 'app-reservas-nueva',
  templateUrl: './reservas-nueva.component.html',
  styleUrls: []
})
export default class ReservasNuevaComponent implements OnInit {

  // Reserva

  // Clientes
  public clienteSeleccionado: any = null;

  // Filtro
  filtroClientes: any = {
    parametro: '',
    direccion: 'desc',
    columna: 'descripcion'
  }

  @ViewChild('searchInputClient')
  public searchInputClient?: ElementRef;

  constructor(
    private alertService: AlertService,
    private dataService: DataService,
    private clientesService: ClientesService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Nueva reserva';
  }

  buscarClientes(): void {
    this.clientesService.listarClientes({
      direccion: this.filtroClientes.direccion,
      columna: this.filtroClientes.columna,
      parametro: this.filtroClientes.parametro,
    }).subscribe({
      next: ({ clientes }) => {
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.filtroClientes.parametro = '';
  }

  deseleccionarCliente(): void {
    this.clienteSeleccionado = null;
    this.filtroClientes.parametro = '';
  }

}
