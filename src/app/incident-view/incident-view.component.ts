import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { FIncident } from '../model/frontend/incident';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incident-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-view.component.html',
  styleUrl: './incident-view.component.css'
})
export class IncidentViewComponent {

  incident!: FIncident;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        if (!params.has("id")) {
          this.router.navigate(["/notfound"]);
          return;
        }
        let id = params.get("id")!;
        if (!this.data.incidentsById.has(id)) {
          this.router.navigate(["/notfound"]);
          return;
        }
        this.incident = this.data.incidentsById.get(id)!;
      });
  }
}
