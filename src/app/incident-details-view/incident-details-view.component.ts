import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { UtilService } from '../util.service';
import { ReversePipe } from '../reverse.pipe';
import { Incident, Impact, IncidentUpdate } from '../../external/lib/status-page-api/angular-client';
import { IncidentId } from '../model/base';

@Component({
  selector: 'app-incident-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ReversePipe],
  templateUrl: './incident-details-view.component.html',
  styleUrl: './incident-details-view.component.css'
})
export class IncidentDetailsViewComponent implements OnInit {

  incidentId!: IncidentId;
  incident!: Incident;
  incidentUpdates!: IncidentUpdate[];

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
        if (!this.data.incidents.has(id)) {
          this.router.navigate(["/notfound"]);
          return;
        }
        this.incidentId = id;
        this.incident = this.data.incidents.get(id)!;
        this.incidentUpdates = this.data.incidentUpdates.get(this.incidentId) ?? [];
      });
  }

  componentName(impact: Impact): string {
    if (!impact.reference) {
      console.error(`Found impact without reference to a component on incident ${this.incidentId}`);
      return "";
    }
    const component = this.data.components.get(impact.reference);
    if (!component) {
      console.error(`No component for impact reference ${impact.reference} found (incident: ${this.incidentId})`);
      return "";
    }
    return "";
  }

  impactType(impact: Impact): string {
    if (!impact.type) {
      return "unknown";
    }
    return this.data.impactTypeName(impact.type);
  }

  impactSeverity(impact: Impact): string {
    if (!impact.severity) {
      console.error(`Found impact without severity value on incident ID ${this.incidentId}`);
      return "";
    }
    return `${this.util.severityName(impact.severity)} (${impact.severity})`;
  }

  df = this.util.formatDate.bind(this.util)
  dfl = this.util.formatLongDate.bind(this.util)
}
