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
import { AbmClienteComponent } from '../../clientes/abm-cliente/abm-cliente.component';
import { AgregarProductoComponent } from '../../productos/agregar-producto/agregar-producto.component';

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
    FiltroProductosPipe,
    AbmClienteComponent,
    AgregarProductoComponent
  ],
  selector: 'app-reservas-nueva',
  templateUrl: './reservas-nueva.component.html',
  styleUrls: []
})
export default class ReservasNuevaComponent implements OnInit {

  // Flags
  public showModalGenerarReserva: boolean = false;

  // Carrito
  public carrito: any[] = [];

  // Reserva
  public dataReserva = {
    fechaReserva: format(new Date(), 'yyyy-MM-dd'),
    fechaEntrega: '',
    fechaAlerta: '',
    horaEntrega: '',
    horaAntes: '',
    tipoObservacion: 'General',
    usuarioCreador: '',
    fechaFinalizacion: '',
    observaciones: '',
    precioTotal: 0,
    adelanto: null,
  };

  // Observaciones torta
  public dataObservacionesTorta: any = {
    relleno1: '',
    relleno2: '',
    relleno3: '',
    forma: '',
    peso: null,
    cobertura: '',
    otrosDetalles: ''
  }

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
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
  }

  abrirAbmCliente(): void {
    this.clientesService.abrirAbm('crear');
  }

  buscarCliente(): void {
    if (this.identificacionCliente.trim() === '') return this.alertService.info('Ingrese una identificación');
    this.alertService.loading();
    this.clientesService.getIdentificacion(this.identificacionCliente).subscribe({
      next: ({ cliente }) => {
        if (cliente) this.seleccionarCliente(cliente)
        else this.abrirAbmCliente();
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  abrirModalAgregarProducto(): void {
    this.productosService.showModalAgregarProducto = true;
  }

  agregarProducto(producto): void {

    // Se verifica si el producto esta cargado
    const productoCargado = this.carrito.find(elemento => elemento.producto.id === producto.producto.id);
    if (productoCargado) return this.alertService.info('El producto ya se encuentra cargado');

    const productoCarrito = {
      producto: producto.producto,
      cantidad: producto.cantidad,
      precioTotal: producto.precioTotal,
      precioUnitario: producto.producto.precioVenta,
    }
    this.carrito = [...this.carrito, productoCarrito];
    this.calcularPrecioTotal();

  }

  eliminarProducto(producto): void {
    this.carrito = this.carrito.filter(elemento => elemento.producto.id !== producto.producto.id);
    this.calcularPrecioTotal();
  }

  calcularPrecioTotal(): void {
    this.dataReserva.precioTotal = 0;
    this.carrito.forEach(producto => this.dataReserva.precioTotal += producto.precioTotal);
  }

  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.identificacionCliente = '';
    this.alertService.close();
  }

  deseleccionarCliente(): void {
    this.clienteSeleccionado = null;
  }

}
