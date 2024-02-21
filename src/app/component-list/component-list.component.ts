import { Component, Input } from '@angular/core';
import { FComponent } from '../model/frontend/component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-component-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component-list.component.html',
  styleUrl: './component-list.component.css'
})
export class ComponentListComponent {

  @Input() id: string = "api-list";
  @Input() data: FComponent[] = [];

  constructor() {}

}
