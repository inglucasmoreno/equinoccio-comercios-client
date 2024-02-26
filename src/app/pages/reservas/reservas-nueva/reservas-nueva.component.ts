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
import { debounceTime, distinctUntilChanged, fromEvent, map } from 'rxjs';

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
export default class ReservasNuevaComponent implements OnInit, AfterViewInit {

  // Reserva

  // Clientes
  public flagBuscandoClientes: boolean = false;
  public clientes: any[] = [];
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

  ngAfterViewInit(): void {

    // Busqueda de clientes en el backend
    fromEvent<any>(this.searchInputClient?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(text => {
        this.clientes = [];
        this.filtroClientes.parametro = text.trim();
        if (this.filtroClientes.parametro !== '') {
          this.flagBuscandoClientes = true;
          this.buscarClientes();
        }
      })

  }

  // Evento de busqueda
  eventoBusqueda(): void {

    // Busqueda de clientes en el backend
    fromEvent<any>(this.searchInputClient?.nativeElement, 'keyup')
      .pipe(
        map(event => event.target.value),
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(text => {
        this.clientes = [];
        this.filtroClientes.parametro = text.trim();
        if (this.filtroClientes.parametro !== '') {
          this.flagBuscandoClientes = true;
          this.buscarClientes();
        }
      })

    }

  buscarClientes(): void {
    this.flagBuscandoClientes = true;
    this.clientesService.listarClientes({
      direccion: this.filtroClientes.direccion,
      columna: this.filtroClientes.columna,
      parametro: this.filtroClientes.parametro,
    }).subscribe({
      next: ({ clientes }) => {
        this.flagBuscandoClientes = false;
        this.clientes = clientes;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.filtroClientes.parametro = '';
    this.clientes = [];
  }

  deseleccionarCliente(): void {
    this.clienteSeleccionado = null;
    this.filtroClientes.parametro = '';
  }

  cerrarBusqueda(): void {
    this.clientes = [];
  }

}
