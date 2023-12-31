import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: []
})
export class HeaderComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit(): void {}

}
