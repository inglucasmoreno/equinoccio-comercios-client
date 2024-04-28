import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { RouterModule } from '@angular/router';
import { PermisosDirective } from '../../directives/permisos.directive';
import { ConfigGeneralesService } from '../../services/config-generales.service';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    RouterModule,
    PermisosDirective
  ],
  templateUrl: './home.component.html',
  styleUrls: []
})
export default class HomeComponent implements OnInit {

  public configGeneral: any = {};

  constructor(
    public dataService: DataService,
    private alertService: AlertService,
    private configGeneralesService: ConfigGeneralesService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Inicio';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.configGeneralesService.listarConfigGenerales({}).subscribe({
      next: ({ configGeneral }) => {
        this.configGeneral = configGeneral[0];
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

}
