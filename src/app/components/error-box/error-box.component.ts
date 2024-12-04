import { Component, Input } from '@angular/core';
import { Result, ResultId } from '../../util/result';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-box.component.html',
  styleUrl: './error-box.component.css'
})
export class ErrorBoxComponent {

  @Input()
  errors!: Map<ResultId, Result>;

  constructor() {}

}
