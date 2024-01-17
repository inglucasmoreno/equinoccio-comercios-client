import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { IngresosService } from '../../../services/ingresos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../../pipes/fecha.pipe';
import { ModalComponent } from '../../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PastillaEstadoComponent } from '../../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../../components/tarjeta-lista/tarjeta-lista.component';
import { add, format } from 'date-fns';
import { ProductosService } from '../../../services/productos.service';

@Component({
  standalone: true,
  selector: 'app-detalles-ingreso',
  imports: [
    CommonModule,
    FormsModule,
    FechaPipe,
    ModalComponent,
    NgxPaginationModule,
    RouterModule,
    PastillaEstadoComponent,
    TarjetaListaComponent,
  ],
  templateUrl: './detalles-ingreso.component.html',
  styleUrls: []
})
export default class DetallesIngresoComponent implements OnInit {

  // Modals
  public showModalIngreso: boolean = false;
  public showModalProductos: boolean = false;
  
  public ingreso: any = {};
  public productos: any[] = [];

  public ingresoForm: any = {
    fechaIngreso: format(new Date(), 'yyyy-MM-dd'),
    nroFactura: '',
    comentario: ''
  };

  constructor(
    private dataService: DataService,
    private ingresosService: IngresosService,
    private productosService: ProductosService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Detalles Ingreso';
    this.alertService.loading();
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {
        this.ingresosService.getIngreso(id).subscribe({
          next: ({ ingreso }) => {
            this.ingreso = ingreso;
            this.reiniciarFormulario();
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  abrirModalIngreso(): void {
    this.showModalIngreso = true;
    this.reiniciarFormulario();
  }

  abrirModalProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos({}).subscribe({
      next: ({ productos }) => {
        this.productos = productos;
        console.log(this.productos);
        this.showModalProductos = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  actualizarIngreso(): void {
    this.alertService.loading();
    this.ingresosService.actualizarIngreso(this.ingreso.id, this.ingresoForm).subscribe({
      next: () => {
        // Reemplazar datos de ingreso
        this.ingreso.fechaIngreso = format(add(new Date(this.ingresoForm.fechaIngreso),{ days: 2 }), 'yyyy-MM-dd');
        this.ingreso.nroFactura = this.ingresoForm.nroFactura;
        this.ingreso.comentario = this.ingresoForm.comentario.toUpperCase();
        this.showModalIngreso = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });  
  }

  reiniciarFormulario(): void {
    const { fechaIngreso, nroFactura, comentario } = this.ingreso;
    this.ingresoForm = { 
      fechaIngreso: format(fechaIngreso, 'yyyy-MM-dd'), 
      nroFactura, 
      comentario };
  }

}
