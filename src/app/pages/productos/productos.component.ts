import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroProductosPipe } from '../../pipes/filtro-productos.pipe';
import { UnidadesMedidaService } from '../../services/unidades-medida.service';
import { MonedaPipe } from '../../pipes/moneda.pipe';
import { ConfigBalanzaService } from '../../services/config-balanza.service';

@Component({
  standalone: true,
  selector: 'app-productos',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    MonedaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
    FiltroProductosPipe
  ],
  templateUrl: './productos.component.html',
  styleUrls: []
})
export default class ProductosComponent implements OnInit {

  // Modal
  public showModalProducto = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Flags
  public alertaStock = false;
  public showAlertaStock = false;

  // Productos
  public idProducto: string = '';
  public productosTMP: any[] = [];
  public productos: any = [];
  public productoSeleccionado: any;
  public descripcion: string = '';
  public unidadesMedida: any[] = [];

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Producto
  public productoForm: any = {
    codigo: '',
    descripcion: '',
    cantidad: 0,
    alertaStock: "false",
    cantidadMinima: null,
    precioCompra: null,
    precioVenta: null,
    porcentajeGanancia: null,
    balanza: "false",
    alicuota: "21",
    unidadMedidaId: "1",
  }

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 'desc',  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(
    private productosService: ProductosService,
    private unidadesMedidaService: UnidadesMedidaService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Productos';
    this.alertService.loading();
    this.listarProductos();
  }

  // Abrir modal
  abrirModal(estado: string, producto: any = null): void {

    this.alertService.loading();

    this.unidadesMedidaService.listarUnidades({ activo: 'true' }).subscribe({
      next: ({ unidades }) => {
        this.unidadesMedida = unidades;

        this.idProducto = '';

        this.reiniciarFormulario();

        this.estadoFormulario = estado;

        if (estado === 'editar') this.getProducto(producto);
        else {
          this.showModalProducto = true;
          this.alertService.close();
        }


      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Traer datos de producto
  getProducto(producto: any): void {
    this.idProducto = producto.id;
    this.productoSeleccionado = producto;
    this.productosService.getProducto(producto.id).subscribe({
      next: ({ producto }) => {
        this.productoForm = {
          codigo: producto.codigo,
          descripcion: producto.descripcion,
          cantidad: producto.cantidad,
          alertaStock: producto.alertaStock.toString(),
          cantidadMinima: producto.cantidadMinima,
          precioCompra: producto.precioCompra,
          precioVenta: producto.precioVenta,
          porcentajeGanancia: producto.porcentajeGanancia,
          balanza: producto.balanza.toString(),
          alicuota: producto.alicuota.toString(),
          unidadMedidaId: producto.unidadMedidaId,
        }
        this.alertService.close();
        this.showModalProducto = true;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar productos
  listarProductos(): void {
    const parametros: any = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }
    this.productosService.listarProductos(parametros).subscribe({
      next: ({ productos }) => {
        this.productos = productos;
        this.productosTMP = productos;
        this.calculoAlertas();
        this.showModalProducto = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  nuevoProducto(): void {

    const message = this.verificarProductoForm();

    if (message !== '') {
      this.alertService.info(message);
      return
    }

    const data = {
      ...this.productoForm,
      alertaStock: this.productoForm.alertaStock == "true" ? true : false,
      balanza: this.productoForm.balanza == "true" ? true : false,
      alicuota: Number(this.productoForm.alicuota),
      unidadMedidaId: Number(this.productoForm.unidadMedidaId),
      creatorUserId: this.authService.usuario.userId,
    }

    this.alertService.loading();

    this.productosService.nuevoProducto(data).subscribe({
      next: ({ producto }) => {
        this.productos = [producto, ...this.productos];
        this.ordenarProductos();
        this.reiniciarFormulario();
        this.alertService.success('Producto creado correctamente');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar producto
  actualizarProducto(): void {

    this.alertService.loading();

    const data = {
      ...this.productoForm,
      alertaStock: this.productoForm.alertaStock == "true" ? true : false,
      balanza: this.productoForm.balanza == "true" ? true : false,
      alicuota: Number(this.productoForm.alicuota),
      unidadMedidaId: Number(this.productoForm.unidadMedidaId),
      cantidadMinima: this.productoForm.alertaStock === 'true' ? Number(this.productoForm.cantidadMinima) : null,
      creatorUserId: this.authService.usuario.userId,
    }

    this.productosService.actualizarProducto(this.idProducto, data).subscribe({
      next: () => {
        this.alertService.loading();
        this.listarProductos();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Verificaciones
  verificarProductoForm(): string {

    let message = '';

    const {
      descripcion,
      unidadMedidaId,
      precioVenta,
      cantidad
    } = this.productoForm;

    if (descripcion.trim() === "") message = 'Debes colocar una descripción';
    else if (unidadMedidaId === "") message = 'Debes seleccionar una unidad de medida';
    else if (!precioVenta || precioVenta < 0) message = 'Debes colocar un precio de venta';
    else if (cantidad < 0) message = 'Debes colocar una cantidad';

    return message;

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(producto: any): void {

    const { id, activo } = producto;

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.productosService.actualizarProducto(id, { activo: !activo }).subscribe({
            next: () => {
              this.alertService.loading();
              this.listarProductos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Calcular precio de venta
  calcularPrecioVenta(): void {
    if (this.productoForm.precioCompra == null || this.productoForm.porcentajeGanancia == null) return;
    const precioCompra = Number(this.productoForm.precioCompra);
    const porcentajeGanancia = Number(this.productoForm.porcentajeGanancia);
    const precioVenta = precioCompra + (precioCompra * (porcentajeGanancia / 100));
    this.productoForm.precioVenta = Number(precioVenta.toFixed(2));
  }

  submit(): void {
    if (this.estadoFormulario === 'crear') this.nuevoProducto();
    else this.actualizarProducto();
  }

  generarCodigo(): void {
    if (this.estadoFormulario === 'editar') {
      this.productoForm.codigo = this.productoSeleccionado.id.toString().padStart(13, '0');
    } else {
      this.alertService.loading();
      this.productosService.generarCodigo().subscribe({
        next: ({ codigo }) => {
          this.productoForm.codigo = codigo;
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }

  }

  cambioAlerta(): void {
    if (this.productoForm.alertaStock === 'false') {
      this.productoForm.cantidadMinima = null;
    }
  }

  // Filtrar por alerta de stock
  filtrarAlertaStock(): void {
    this.showAlertaStock = !this.showAlertaStock;
    if (this.showAlertaStock)
      this.productos = this.productos.filter((producto: any) => producto.alertaStock && producto.cantidad < producto.cantidadMinima);
    else
      this.productos = this.productosTMP;
  }

  // Reiniciar formulario - Productos
  reiniciarFormulario(): void {
    this.productoForm = {
      codigo: '',
      descripcion: '',
      cantidad: 0,
      alertaStock: "false",
      cantidadMinima: null,
      precioCompra: null,
      precioVenta: null,
      porcentajeGanancia: null,
      balanza: "false",
      alicuota: "21",
      unidadMedidaId: "1",
    }
  }

  // Calculo de alertas
  calculoAlertas(): void {
    this.alertaStock = false;
    this.productos.forEach((producto: any) => {
      if (producto.alertaStock && producto.cantidad < producto.cantidadMinima) {
        this.alertaStock = true;
      }
    });
  }

  // Adaptando unidad de medida
  adaptandoUnidadMedida(): void {
    if (this.productoForm.balanza === 'true') {
      this.productoForm.unidadMedidaId = '2';
      this.productoForm.codigo = '';
    }else{
      this.productoForm.unidadMedidaId = '1';
    }
  }

  // Adaptando codigo
  adaptandoCodigo(): void {

    if(this.productoForm.balanza === 'true'){

      if(this.productoForm.codigo.length !== this.dataService.mascaraProducto.length){
        this.alertService.info(`El código debe tener ${this.dataService.mascaraProducto.length} digitos`);
        return;
      }

      let codigo = this.productoForm.codigo;
      let mascara = this.dataService.mascaraProducto;
      let nuevoCodigo = '';

      for (let i = 0; i < mascara.length; i++) {
        if (mascara[i] === 'y') nuevoCodigo += codigo[i];
        else nuevoCodigo += '';
      }

      this.productoForm.codigo = nuevoCodigo;

    }

  }

  // Ordenar productos por descripcion
  ordenarProductos(): void {
    this.ordenarPorColumna('descripcion');
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 'asc' ? 'desc' : 'asc';
    this.alertService.loading();
    this.listarProductos();
  }

}
