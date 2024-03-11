import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ProductosService } from '../../../services/productos.service';
import { DataService } from '../../../services/data.service';
import { UnidadesMedidaService } from '../../../services/unidades-medida.service';

@Component({
  standalone: true,
  selector: 'app-abm-producto',
  templateUrl: './abm-producto.component.html',
  styleUrls: [],
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    RouterModule,
  ]
})
export default class AbmProductoComponent implements OnInit {

  @Output()
  public insertEvent = new EventEmitter<any>();

  @Output()
  public updateEvent = new EventEmitter<any>();

  // Unidades de medida
  public unidadesMedida: any[] = [];

  constructor(
    private authService: AuthService,
    private unidadesMedidaService: UnidadesMedidaService,
    private dataService: DataService,
    private alertService: AlertService,
    public productosService: ProductosService,
  ) { }

  ngOnInit() {
    this.alertService.loading();
    this.inicializacion();
  }

  inicializacion(): void {
    this.unidadesMedidaService.listarUnidades({ activo: 'true' }).subscribe({
      next: ({ unidades }) => {
        this.unidadesMedida = unidades;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  nuevoProducto(): void {

    // Verificacion
    if (this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();

    const data = {
      ...this.productosService.abmForm,
      alertaStock: this.productosService.abmForm.alertaStock == "true" ? true : false,
      balanza: this.productosService.abmForm.balanza == "true" ? true : false,
      alicuota: Number(this.productosService.abmForm.alicuota),
      unidadMedidaId: Number(this.productosService.abmForm.unidadMedidaId),
      creatorUserId: this.authService.usuario.userId,
    }

    this.productosService.nuevoProducto(data).subscribe({
      next: ({ producto }) => {
        this.insertEvent.emit(producto);
        this.productosService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  actualizarProducto(): void {

    // Verificacion
    if (this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

    this.alertService.loading();

    const data = {
      ...this.productosService.abmForm,
      alertaStock: this.productosService.abmForm.alertaStock == "true" ? true : false,
      balanza: this.productosService.abmForm.balanza == "true" ? true : false,
      alicuota: Number(this.productosService.abmForm.alicuota),
      unidadMedidaId: Number(this.productosService.abmForm.unidadMedidaId),
      cantidadMinima: this.productosService.abmForm.alertaStock === 'true' ? Number(this.productosService.abmForm.cantidadMinima) : null,
      creatorUserId: this.authService.usuario.userId,
    }

    this.productosService.actualizarProducto(this.productosService.productoSeleccionado.id, data).subscribe({
      next: ({ producto }) => {
        this.updateEvent.emit(producto);
        this.productosService.showModalAbm = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Adaptando unidad de medida
  adaptandoUnidadMedida(): void {
    if (this.productosService.abmForm.balanza === 'true') {
      this.productosService.abmForm.unidadMedidaId = '2';
      this.productosService.abmForm.codigo = '';
    } else {
      this.productosService.abmForm.unidadMedidaId = '1';
    }
  }


  // Adaptando codigo
  adaptandoCodigo(): void {

    if (this.productosService.abmForm.balanza === 'true') {

      if (this.productosService.abmForm.codigo.length !== this.dataService.mascaraProducto.length) {
        this.alertService.info(`El código debe tener ${this.dataService.mascaraProducto.length} digitos`);
        return;
      }

      let codigo = this.productosService.abmForm.codigo;
      let mascara = this.dataService.mascaraProducto;
      let nuevoCodigo = '';

      for (let i = 0; i < mascara.length; i++) {
        if (mascara[i] === 'y') nuevoCodigo += codigo[i];
        else nuevoCodigo += '';
      }

      this.productosService.abmForm.codigo = nuevoCodigo;

    }

  }

  generarCodigo(): void {
    if (this.productosService.estadoAbm === 'editar') {
      this.productosService.abmForm.codigo = this.productosService.productoSeleccionado.id.toString().padStart(13, '0');
    } else {
      this.alertService.loading();
      this.productosService.generarCodigo().subscribe({
        next: ({ codigo }) => {
          this.productosService.abmForm.codigo = codigo;
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }

  }

  // Calcular precio de venta
  calcularPrecioVenta(): void {
    if (this.productosService.abmForm.precioCompra == null || this.productosService.abmForm.porcentajeGanancia == null) return;
    const precioCompra = Number(this.productosService.abmForm.precioCompra);
    const porcentajeGanancia = Number(this.productosService.abmForm.porcentajeGanancia);
    const precioVenta = precioCompra + (precioCompra * (porcentajeGanancia / 100));
    this.productosService.abmForm.precioVenta = Number(precioVenta.toFixed(2));
  }

  cambioAlerta(): void {
    if (this.productosService.abmForm.alertaStock === 'false') {
      this.productosService.abmForm.cantidadMinima = null;
    }
  }

  // Verificacion de datos
  verificacionDatos(): string {

    let message = '';

    const {
      descripcion,
      unidadMedidaId,
      precioVenta,
      cantidad
    } = this.productosService.abmForm;

    if (descripcion.trim() === "") message = 'Debes colocar una descripción';
    else if (unidadMedidaId === "") message = 'Debes seleccionar una unidad de medida';
    else if (!precioVenta || precioVenta < 0) message = 'Debes colocar un precio de venta';
    // else if (cantidad !== null) message = 'Debes colocar una cantidad';

    return message;

  }

  submit(): void {
    if (this.productosService.estadoAbm === 'crear') this.nuevoProducto();
    else this.actualizarProducto();
  }


}
