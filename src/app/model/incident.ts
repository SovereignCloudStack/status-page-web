
export interface SComponent {
    displayName: string,
    activelyAffectedBy: SImpactComponent[]
}

export interface SImpactComponent {
    reference: string,
    type: string
}

export interface SIncident {
    displayName: string,
    description: string,
    beganAt: string | null,
    endetAt: string | null,
}

