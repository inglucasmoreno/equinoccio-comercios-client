import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
import { ProductosService } from '../../../services/productos.service';
import { FiltroProductosPipe } from '../../../pipes/filtro-productos.pipe';
import { AlertService } from '../../../services/alert.service';
import { MonedaPipe } from '../../../pipes/moneda.pipe';

@Component({
  standalone: true,
  selector: 'app-agregar-producto',
  templateUrl: './agregar-producto.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
    FiltroProductosPipe,
    MonedaPipe
  ]
})
export class AgregarProductoComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  public productoSeleccionado: any = null;
  public productos: any[] = [];
  public cantidad: number = null;

  public filtroProductos = {
    parametro: '',
  }

  constructor(
    public productosService: ProductosService,
    public alertService: AlertService,
  ) { }

  ngOnInit() {
    this.inicializacion();
  }

  inicializacion(): void {
    this.productosService.listarProductos({}).subscribe({
      next: ({ productos }) => {
        this.productos = productos;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  seleccionarProducto(producto): void {
    this.productoSeleccionado = producto;
  }

  deseleccionarProducto(): void {
    this.productoSeleccionado = null;
    this.reiniciarForm();
  }

  agregarProducto(): void {

    if(!this.cantidad || this.cantidad < 0) return this.alertService.info('Debe colocar una cantidad válida')

    const dataEvent = {
      producto: this.productoSeleccionado,
      cantidad: this.cantidad,
      precioTotal: this.cantidad * this.productoSeleccionado.precioVenta,
    }

    this.insertEvent.emit(dataEvent);
    this.productoSeleccionado = null;
    this.reiniciarForm();

  }

  reiniciarForm(): void {
    this.filtroProductos.parametro = '';
    this.cantidad = null;
  }

}
