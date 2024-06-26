import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import AlertaReservaComponent from '../components/alerta-reserva/alerta-reserva.component';

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    NavbarComponent,
    AlertaReservaComponent
  ],
  templateUrl: './pages.component.html',
  styleUrls: []
})
export default class PagesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
