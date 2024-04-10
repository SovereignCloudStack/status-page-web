import { Component, Input } from '@angular/core';
import { FComponent } from '../model/frontend/component';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '../app-config.service';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-component-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component-list.component.html',
  styleUrl: './component-list.component.css'
})
export class ComponentListComponent {

  @Input() data: FComponent[] = [];

  constructor(
    public config: AppConfigService,
    public util: UtilService
  ) {}

}
