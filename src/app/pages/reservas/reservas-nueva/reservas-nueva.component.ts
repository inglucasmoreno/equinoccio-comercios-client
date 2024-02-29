import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { DataService } from '../../../services/data.service';
import { ClientesService } from '../../../services/clientes.service';
import { format } from 'date-fns';
import { ProductosService } from '../../../services/productos.service';
import { MonedaPipe } from '../../../pipes/moneda.pipe';
import gsap from 'gsap';
import { FiltroProductosPipe } from '../../../pipes/filtro-productos.pipe';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    MonedaPipe,
    FiltroProductosPipe
  ],
  selector: 'app-reservas-nueva',
  templateUrl: './reservas-nueva.component.html',
  styleUrls: []
})
export default class ReservasNuevaComponent implements OnInit {

  // Flags
  public showModalProductos: boolean = false;

  // Productos
  public productos: any[] = [];
  public productoSeleccionado: any = null;

  // Reserva
  public dataReserva: any = {
    fechaReserva: format(new Date(), 'yyyy-MM-dd'),
  };

  // Clientes
  public clienteSeleccionado: any = null;
  public identificacionCliente: string = '';

  // Filtro
  filtroProductos: any = {
    parametro: '',
  }

  constructor(
    private alertService: AlertService,
    private productosService: ProductosService,
    private dataService: DataService,
    private clientesService: ClientesService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Nueva reserva';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
  }

  buscarCliente(): void {
    if(this.identificacionCliente.trim() === '') return this.alertService.info('Ingrese una identificación');
    this.alertService.loading();
    this.clientesService.getIdentificacion(this.identificacionCliente).subscribe({
      next: ({ cliente }) => {
        this.clienteSeleccionado = cliente;
        this.identificacionCliente = '';
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  abrirModalProductos(): void {
    this.filtroProductos.parametro = '';
    this.alertService.loading();
    this.productosService.listarProductos({}).subscribe({
      next: ({ productos }) => {
        this.showModalProductos = true;
        this.productos = productos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  seleccionarProducto(cliente: any): void {
    this.productoSeleccionado = cliente;
    this.filtroProductos.parametro = '';
  }

  deseleccionarCliente(): void {
    this.clienteSeleccionado = null;
  }

}
