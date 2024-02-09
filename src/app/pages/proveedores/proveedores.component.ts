import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { PastillaEstadoComponent } from '../../components/pastilla-estado/pastilla-estado.component';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { FiltroProveedoresPipe } from '../../pipes/filtro-proveedores.pipe';
import { ProveedoresService } from '../../services/proveedores.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { DataService } from '../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-proveedores',
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
  ],
  templateUrl: './proveedores.component.html',
  styleUrls: []
})
export default class ProveedoresComponent implements OnInit {

 // Modal
 public showModalProveedor = false;

 // Estado formulario
 public estadoFormulario = 'crear';

 // Proveedor
 public idProveedor: string = '';
 public proveedores: any = [];
 public proveedorSeleccionado: any;

 public proveedorForm = {
   descripcion: '',
   tipo_identificacion: 'DNI',
   identificacion: '',
   telefono: '',
   domicilio: '',
 }

 // Paginacion
 public paginaActual: number = 1;
 public cantidadItems: number = 10;

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
   private proveedoresService: ProveedoresService,
   private authService: AuthService,
   private alertService: AlertService,
   private dataService: DataService
 ) { }

 ngOnInit(): void {
   this.dataService.ubicacionActual = 'Dashboard - Proveedores';
   this.alertService.loading();
   this.listarProveedores();
 }

 // Abrir modal
 abrirModal(estado: string, proveedor: any = null): void {
   this.reiniciarFormulario();
   this.idProveedor = '';
   if (estado === 'editar') this.getProveedor(proveedor);
   else this.showModalProveedor = true;
   this.estadoFormulario = estado;
 }

 // Traer datos de proveedor
 getProveedor(proveedor: any): void {
   this.alertService.loading();
   this.idProveedor = proveedor.id;
   this.proveedorSeleccionado = proveedor;
   this.proveedoresService.getProveedor(proveedor.id).subscribe({
     next: ({ proveedor }) => {
       this.proveedorForm = {
         descripcion: proveedor.descripcion,
         tipo_identificacion: proveedor.tipo_identificacion,
         identificacion: proveedor.identificacion,
         telefono: proveedor.telefono,
         domicilio: proveedor.domicilio,
       };
       this.alertService.close();
       this.showModalProveedor = true;
     }, error: ({ error }) => this.alertService.errorApi(error.message)
   });
 }

 // Listar proveedores
 listarProveedores(): void {
   const parametros: any = {
     direccion: this.ordenar.direccion,
     columna: this.ordenar.columna
   }
   this.proveedoresService.listarProveedores(parametros).subscribe({
     next: ({ proveedores }) => {
       this.proveedores = proveedores;
       this.showModalProveedor = false;
       this.alertService.close();
     }, error: ({ error }) => this.alertService.errorApi(error.message)
   })
 }

 // Nuevo proveedor
 nuevoProveedor(): void {

   if(this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

   this.alertService.loading();

   const data = {
     ...this.proveedorForm,
     creatorUserId: this.authService.usuario.userId
   }

   this.proveedoresService.nuevoProveedor(data).subscribe({
     next: () => {
       this.alertService.loading();
       this.listarProveedores();
     }, error: ({ error }) => this.alertService.errorApi(error.message)
   })

 }

 // Actualizar proveedor
 actualizarProveedor(): void {

   if(this.verificacionDatos() !== '') return this.alertService.info(this.verificacionDatos());

   this.alertService.loading();

   this.proveedoresService.actualizarProveedor(this.proveedorSeleccionado.id, this.proveedorForm).subscribe({
     next: () => {
       this.alertService.loading();
       this.listarProveedores();
     }, error: ({ error }) => this.alertService.errorApi(error.message)
   });

 }

 // Actualizar estado Activo/Inactivo
 actualizarEstado(proveedor: any): void {

   const { id, activo } = proveedor;

   this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
     .then(({ isConfirmed }) => {
       if (isConfirmed) {
         this.alertService.loading();
         this.proveedoresService.actualizarProveedor(id, { activo: !activo }).subscribe({
           next: () => {
             this.alertService.loading();
             this.listarProveedores();
           }, error: ({ error }) => this.alertService.errorApi(error.message)
         })
       }
     });
 }

 // Verificacion de datos
 verificacionDatos(): string {
   const { descripcion, identificacion } = this.proveedorForm;
   let msg = '';
   if(descripcion.trim() === '') msg = 'Debe colocar un Nombre o Razon Social';
   else if(identificacion.trim() === '') msg = 'Debe colocar una identificación';
   return msg;
 }

 // Reiniciando formulario
 reiniciarFormulario(): void {
   this.proveedorForm = {
     descripcion: '',
     tipo_identificacion: 'DNI',
     identificacion: '',
     telefono: '',
     domicilio: '',
   }
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
   this.listarProveedores();
 }

}
