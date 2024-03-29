import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: []
})
export default class HomeComponent implements OnInit {

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.dataService.ubicacionActual = 'Dashboard - Inicio';
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
  }

}
