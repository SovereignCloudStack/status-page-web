import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { FIncident } from '../model/frontend/incident';
import { CommonModule } from '@angular/common';
import { UtilService } from '../util.service';
import { ReversePipe } from '../reverse.pipe';
import { FComponent } from '../model/frontend/component';

@Component({
  selector: 'app-incident-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe],
  templateUrl: './incident-details-view.component.html',
  styleUrl: './incident-details-view.component.css'
})
export class IncidentDetailsViewComponent implements OnInit {

  incident!: FIncident;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService,
    public util: UtilService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        if (!params.has("id")) {
          this.router.navigate(["/notfound"]);
          return;
        }
        const id = params.get("id")!;
        if (!this.data.incidentsById.has(id)) {
          this.router.navigate(["/notfound"]);
          return;
        }
        this.incident = this.data.incidentsById.get(id)!;
      });
  }

  impactType(component: FComponent): string {
    for (const impact of this.incident.serverSide.affects) {
      if (impact.reference == component.id) {
        return this.data.impactTypeName(impact.type);
      }
    }
    return "unknown";
  }

  df = this.util.formatDate.bind(this.util)
  dfl = this.util.formatLongDate.bind(this.util)
}
