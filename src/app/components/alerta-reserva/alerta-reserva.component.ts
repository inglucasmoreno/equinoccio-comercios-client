import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-alerta-reserva',
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './alerta-reserva.component.html',
  styleUrls: ['./alerta-reserva.component.css']
})
export default class AlertaReservaComponent implements OnInit {

  constructor(
    public dataService: DataService
  ) { }

  ngOnInit() {
  }

}
