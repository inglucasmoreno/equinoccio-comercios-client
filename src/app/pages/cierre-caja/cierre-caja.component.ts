import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaPipe } from '../../pipes/fecha.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { TarjetaListaComponent } from '../../components/tarjeta-lista/tarjeta-lista.component';
import { MonedaPipe } from '../../pipes/moneda.pipe';
import { TiposIngresosService } from '../../services/tipos-ingresos.service';
import { TiposGastosService } from '../../services/tipos-gastos.service';
import { AlertService } from '../../services/alert.service';
import { CajasService } from '../../services/cajas.service';
import { IngresosCajasService } from '../../services/ingresos-cajas.service';
import { GastosCajasService } from '../../services/gastos-cajas.service';
import { format } from 'date-fns';

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
    TarjetaListaComponent,
  ],
  selector: 'app-cierre-caja',
  templateUrl: './cierre-caja.component.html',
  styleUrls: []
})
export default class CierreCajaComponent implements OnInit {

  // Modals
  public showModalPostnet = false;
  public showModalIngresoGasto = false;
  public showModalCerrarCaja = false;

  // Flags
  public iniciando = true;
  public saldoInicialTMP = 0;
  public showEditarSaldoInicial = false;
  public showTotalFacturado = false;
  public showIngresos = true;
  public showGastos = true;

  // Caja
  public idCaja = null;
  public saldoInicial = 0;
  public totales: any = {};

  // Ingresos - Gastos
  public totalIngresos = 0;
  public totalGastos = 0;
  public ingresos: any[] = [];
  public gastos: any[] = [];
  public tipos: any[] = [];
  public dataIngresoGasto = {
    ingresoGasto: 'gasto',
    tipoId: '',
    tipoDescripcion: '',
    monto: null,
    descripcion: ''
  }

  // Cierre de caja
  public fechaCaja = format(new Date(), 'yyyy-MM-dd');
  public totalEfectivoCajaReal = null;
  public montoTesoreria = null;
  public diferenciaCaja = 0;
  public saldoProximaCaja = 0;

  // Ingresos gastos
  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private dataService: DataService,
    private tiposIngresos: TiposIngresosService,
    private tiposGastos: TiposGastosService,
    private ingresosService: IngresosCajasService,
    private gastosService: GastosCajasService,
    private cajasService: CajasService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = " Dashboard - Cierre de caja";
    this.cargaInicial();
  }

  cargaInicial(): void {

    this.alertService.loading();

    this.cajasService.listarCajas({ activo: 'true' }).subscribe({
      next: ({ cajas }) => {

        this.idCaja = cajas[0] ? cajas[0].id : null;

        if (cajas[0]) {
          this.saldoInicial = cajas[0].saldoInicial ? cajas[0].saldoInicial : 0;
          this.saldoInicialTMP = cajas[0].saldoInicial ? cajas[0].saldoInicial : 0;
          this.getCaja();
        } else {
          this.alertService.close();
        }

        this.iniciando = false;

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  getCaja(): void {
    this.cajasService.getTotalesActivos(this.idCaja).subscribe({
      next: ({ totales, ingresos, gastos }) => {
        this.saldoInicial = totales.saldoInicial;
        this.ingresos = ingresos;
        this.totales = totales;
        this.gastos = gastos;
        this.totalIngresos = totales.totalIngresos;
        this.totalGastos = totales.totalGastos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  abrirIngresoGasto() {

    this.reiniciarIngresoGasto();

    this.alertService.loading();

    if (this.dataIngresoGasto.ingresoGasto === 'ingreso') {
      this.tiposIngresos.listarTipos({ activo: 'true' }).subscribe({
        next: ({ tipos }) => {
          this.tipos = tipos;
          this.showModalIngresoGasto = true;
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      });
    } else {
      this.tiposGastos.listarTipos({ activo: 'true' }).subscribe({
        next: ({ tipos }) => {
          this.tipos = tipos;
          this.showModalIngresoGasto = true;
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      });
    }

  }

  cambiarTipoIngresoGasto() {
    this.alertService.loading();
    if (this.dataIngresoGasto.ingresoGasto === 'ingreso') {
      this.tiposIngresos.listarTipos({ activo: 'true' }).subscribe({
        next: ({ tipos }) => {
          this.tipos = tipos;
          this.dataIngresoGasto.tipoId = '';
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      });
    } else {
      this.tiposGastos.listarTipos({ activo: 'true' }).subscribe({
        next: ({ tipos }) => {
          this.tipos = tipos;
          this.dataIngresoGasto.tipoId = '';
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      });
    }
  }

  agregarIngresoGasto() {

    const {
      ingresoGasto,
      tipoId,
      monto,
      descripcion
    } = this.dataIngresoGasto;

    // Verificacion si los campos estan vacios

    if (tipoId === '') {
      this.alertService.info('Debes seleccionar un tipo');
      return;
    }

    if (monto <= 0) {
      this.alertService.info('Debes ingresar un monto valido');
      return;
    }

    if (descripcion === '') {
      this.alertService.info('Debes ingresar una descripcion');
      return;
    }

    this.alertService.loading();

    if (ingresoGasto === 'ingreso') {

      let data = {
        tipoIngresoId: Number(tipoId),
        monto,
        cajaId: Number(this.idCaja),
        descripcion,
        creatorUserId: this.authService.usuario.userId
      }

      this.ingresosService.nuevoIngresoCaja(data).subscribe({
        next: () => {
          this.showModalIngresoGasto = false;
          this.reiniciarIngresoGasto();
          this.getCaja();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    } else {

      let data = {
        tipoGastoId: Number(tipoId),
        monto,
        cajaId: Number(this.idCaja),
        descripcion,
        creatorUserId: this.authService.usuario.userId
      }

      this.gastosService.nuevoGastoCaja(data).subscribe({
        next: () => {
          this.showModalIngresoGasto = false;
          this.reiniciarIngresoGasto();
          this.getCaja();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }
  }

  eliminarIngreso(id: number): void {
    this.alertService.question({ msg: `¿Quieres eliminar el ingreso?`, buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ingresosService.eliminarIngresoCaja(id).subscribe({
            next: () => {
              this.getCaja();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  eliminarGasto(id: number): void {
    this.alertService.question({ msg: `¿Quieres eliminar el gasto?`, buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.gastosService.eliminarGastoCaja(id).subscribe({
            next: () => {
              this.getCaja();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  activarCaja(): void {
    this.alertService.question({ msg: `Estas por activar una caja`, buttonText: 'Activar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.cajasService.nuevaCaja({
            creatorUserId: 3
          }).subscribe({
            next: ({ caja }) => {
              this.idCaja = caja.id;
              this.saldoInicial = caja.saldoInicial;
              this.saldoInicialTMP = caja.saldoInicial;
              this.getCaja();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  abrirEditarSaldoInicial(): void {
    this.saldoInicialTMP = this.saldoInicial;
    this.showEditarSaldoInicial = true;
  }

  cerrarEditarSaldoInicial(): void {
    this.showEditarSaldoInicial = false;
  }

  abrirCierreCaja(): void {
    this.totalEfectivoCajaReal = null;
    this.montoTesoreria = null;
    this.diferenciaCaja = 0;
    this.saldoProximaCaja = 0;
    this.showModalCerrarCaja = true;

  }

  editarSaldoInicial(): void {

    // Verificacion de nuevo saldo inicial
    if (this.saldoInicialTMP === null || this.saldoInicialTMP < 0) {
      this.alertService.info('Debes ingresar un saldo inicial valido');
      return;
    }

    this.alertService.question({ msg: `¿Quieres editar el saldo inicial?`, buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.cajasService.actualizarCaja(this.idCaja, { saldoInicial: this.saldoInicialTMP }).subscribe({
            next: ({ caja }) => {
              this.saldoInicial = caja.saldoInicial;
              this.saldoInicialTMP = caja.saldoInicial;
              this.showEditarSaldoInicial = false;
              this.getCaja();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  calcularCierreCaja(): void {
    this.diferenciaCaja = this.totalEfectivoCajaReal - this.totales?.totalEfectivoEnCaja;
    this.saldoProximaCaja = this.totalEfectivoCajaReal - this.montoTesoreria;
  }

  completarCierreCaja(): void {

    // Verificacion de fecha de caja
    if (this.fechaCaja === null || this.fechaCaja === '') {
      this.alertService.info('Debes ingresar una fecha de caja valida');
      return;
    }

    // Verificacion: Total efectivo caja real
    if (this.totalEfectivoCajaReal === null || this.totalEfectivoCajaReal < 0) {
      this.alertService.info('Debes ingresar un total de efectivo valido');
      return;
    }

    // Verificacion: Total tesoreria
    if (this.montoTesoreria === null || this.montoTesoreria < 0) {
      this.alertService.info('Debes ingresar un monto de tesoreria valido');
      return;
    }

    // Verificacion: Cantidad de ventas
    if (this.totales?.cantidadVentas <= 0) {
      this.alertService.info('Debes tener al menos una venta en caja');
      return;
    }

    this.alertService.question({ msg: `Completando cierre de caja`, buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.cajasService.completarCaja(this.idCaja, {
            totalEfectivoCajaReal: this.totalEfectivoCajaReal,
            tesoreria: this.montoTesoreria,
            fechaCaja: this.fechaCaja,
            creatorUserId: this.authService.usuario.userId,
          }).subscribe({
            next: ({ caja }) => {
              this.idCaja = caja.id;
              this.showModalCerrarCaja = false;
              this.getCaja();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  reiniciarIngresoGasto() {
    this.dataIngresoGasto = {
      ingresoGasto: 'gasto',
      tipoId: '',
      tipoDescripcion: '',
      monto: null,
      descripcion: ''
    }
  }

}
