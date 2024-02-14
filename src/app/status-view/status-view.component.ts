import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SComponent } from '../model/incident';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-status-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-view.component.html',
  styleUrl: './status-view.component.css'
})
export class StatusViewComponent {

  components!: Observable<SComponent[]>;

  constructor(
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.components = this.http.get<SComponent[]>("/api/components");
  }
}
