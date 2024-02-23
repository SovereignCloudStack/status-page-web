import { Component, Input } from '@angular/core';
import { FComponent } from '../model/frontend/component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-component-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component-table.component.html',
  styleUrl: './component-table.component.css'
})
export class ComponentTableComponent {

  @Input() data: FComponent[] = [];
}
