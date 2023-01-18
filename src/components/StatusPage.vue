<template>

    <v-app>
        <v-system-bar>
            <v-spacer></v-spacer>
            <v-icon>mdi-account</v-icon> DEBUG: Anonymous admin access
        </v-system-bar>
        <v-app-bar>
            <v-toolbar-title>
                Status Page
            </v-toolbar-title>
        </v-app-bar>
        <v-main class="bg-blue-lighten-5">
            <v-container>
                <v-row>
                    <v-col>
                        <v-expansion-panels>
                            <v-expansion-panel v-for="component in components" :key="component.id">
                                <v-expansion-panel-title
                                    :class="component.affectedBy.length ? ['bg-red'] : ['bg-green']">
                                    {{ component.displayName }}
                                    <v-chip v-for="(value, key) in component.labels" :key="key">
                                        {{ key }}={{ value }}
                                    </v-chip>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text v-if="component.affectedBy.length">
                                    Currently affected by:
                                    <template v-for="incident in component.affectedBy" :key="incident">
                                        <v-chip>{{ incident.title }}</v-chip>
                                    </template>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-timeline side="end" align="start">
                            <v-timeline-item
                                :icon="'mdi-chevron-triple-up'"
                                icon-color="white"
                                size="small">
                                since {{startTimeString}}
                                <v-btn @click="loadEarlier">
                                    Load more
                                </v-btn>
                            </v-timeline-item>
                            <v-timeline-item
                                v-for="incident in incidents" :key="incident.ID"
                                :dot-color="incident.phase === lastPhase ? 'green' : 'red'"
                                :icon="'mdi-fire'"
                                size="large">
                                <v-card>
                                    <v-card-title :class="['text-h6', incident.phase === lastPhase ? 'bg-green' : 'bg-red']">
                                        {{incident.title}}
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container>
                                            <v-row>
                                                <v-col>
                                                    <strong>Began at:</strong>
                                                    <div>
                                                        {{incident.beganAt || "unknown"}}
                                                    </div>
                                                </v-col>
                                                <v-col>
                                                    <strong>Ended at:</strong>
                                                    <div>
                                                        {{incident.endedAt || "unknown"}}
                                                    </div>
                                                </v-col>
                                                <v-col>
                                                    <strong>Phase:</strong>
                                                    <div>
                                                        {{incident.phase}}
                                                    </div>
                                                </v-col>
                                                <v-col>
                                                    <strong>Affected components:</strong>
                                                    <ul>
                                                        <li v-for="componentId in incident.affects" :key="componentId">
                                                            {{ getInMemoryComponentName(componentId) }}
                                                        </li>
                                                    </ul>
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col>
                                                    <strong>Description:</strong>
                                                    <div>
                                                        {{ incident.description }}
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <template v-if="incident.updates">
                                                <v-row v-for="(update, i) in incident.updates" :key="i">
                                                    <v-col>
                                                        <strong>Update {{ i+1 }}</strong> ({{ update.createdAt }}):
                                                        <div>
                                                            {{ update.text }}
                                                        </div>
                                                    </v-col>
                                                </v-row>
                                            </template>
                                        </v-container>
                                    </v-card-text>
                                </v-card>
                            </v-timeline-item>
                            <v-timeline-item
                                size="small"
                                icon="mdi-chevron-triple-down"
                                icon-color="white">
                                up to {{endTimeString}}
                                <v-btn @click="loadLater">
                                    Load more
                                </v-btn>
                            </v-timeline-item>
                        </v-timeline>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        let now = new Date()
        now.setHours(0)
        now.setMinutes(0)
        now.setSeconds(0)
        return {
            components: [],
            incidents: [],
            phases: [],
            timeRange: {
                start: new Date(new Date(now).setDate(now.getDate() - 7)),
                end: now
            }
        }
    },
    mounted() {
        this.sync()
    },
    computed: {
        startTimeString() {
            return this.timeRange.start.toLocaleDateString()
        },
        endTimeString () {
            return this.timeRange.end.toLocaleDateString()
        },
        lastPhase() {
            if (this.phases.length === 0) {
                return ""
            }
            return this.phases[this.phases.length-1]
        }
    },
    methods: {
        sync: function() {
            let baseUrl = `https://${window.location.host}/`
            let self = this
            axios.get(baseUrl + `/api/phases`)
            .then(function(response){
                self.phases = response.data
            })
            axios.get(baseUrl+"/api/components")
            .then(function(response){
                self.components = response.data
                self.components.forEach((component, componentI) => {
                    component.affectedBy.forEach((incidentId, incidentI) => {
                        axios.get(baseUrl + `/api/incident/${incidentId}`).then((response) => {
                            self.components[componentI].affectedBy[incidentI] = response.data
                        })
                    })
                })
            })
            axios.get(baseUrl + `/api/incidents?start=${this.timeRange.start.toISOString()}&end=${this.timeRange.end.toISOString()}`)
            .then(function(response){
                self.incidents = response.data
            })
        },
        loadEarlier: function() {
            this.timeRange.start = new Date(this.timeRange.start.setDate(this.timeRange.start.getDate() - 7))
            this.sync()
        },
        loadLater: function() {
            this.timeRange.end = new Date(this.timeRange.end.setDate(this.timeRange.end.getDate() + 7))
            this.sync()
        },
        getInMemoryComponentName(componentId) {
            let result = this.components.filter((component) => {
                return component.id === componentId
            })
            if (result.length === 0) {
                return "..."
            }
            return result[0].displayName
        }
    }
}
</script>
