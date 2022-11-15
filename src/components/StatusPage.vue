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
                        <div class="text-subtitle-1 mb-2">Components</div>
                        <v-expansion-panels>
                            <v-expansion-panel v-for="component in components" :key="component.slug">
                                <v-expansion-panel-title
                                    :class="component.conditions !== undefined ? ['bg-red'] : ['bg-green']">
                                    {{ component.slug }}
                                    <v-chip v-for="(value, key) in component.labels" :key="key">
                                        {{ key }}={{ value }}
                                    </v-chip>
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    Current condition:
                                    <template v-if="component.conditions === undefined">
                                        OK
                                    </template>
                                    <template v-else v-for="condition in component.conditions" :key="condition">
                                        <v-chip>{{ condition }}</v-chip>
                                    </template>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                    <v-col>
                        <div class="text-subtitle-1 mb-2">Incidents</div>
                        <v-timeline side="end">
                            <v-timeline-item
                                v-for="incident in incidents" :key="incident.ID"
                                :dot-color="incident.phase.slug === 'closed' ? 'green' : 'red'">
                                <v-card>
                                    <v-card-title :class="['text-h6', incident.phase.slug === 'closed' ? 'bg-green' : 'bg-red']">
                                        {{incident.title}}
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container>
                                            <v-row>
                                                <v-col>
                                                    <strong>ID:</strong>
                                                    <div>
                                                        {{incident.ID}}
                                                    </div>
                                                </v-col>
                                                <v-col>
                                                    <strong>Beginning:</strong>
                                                    <div>
                                                        {{incident.beganAt || "unknown"}}
                                                    </div>
                                                </v-col>
                                                <v-col>
                                                    <strong>Phase:</strong>
                                                    <div>
                                                        {{incident.phase.slug}}
                                                    </div>
                                                </v-col>
                                                <v-col>
                                                    <strong>Affected components:</strong>
                                                    <ul>
                                                        <li v-for="component in incident.components" :key="component.slug">
                                                            {{component.slug}}
                                                        </li>
                                                    </ul>
                                                </v-col>
                                                <v-col>
                                                    <v-expansion-panels>
                                                        <v-expansion-panel elevation="1">
                                                            <v-expansion-panel-title>
                                                                History
                                                                <template v-slot:actions>
                                                                    <v-icon icon="mdi-history"></v-icon>
                                                                </template>
                                                            </v-expansion-panel-title>
                                                            <v-expansion-panel-text>
                                                                <pre>{{JSON.stringify(incident.history, null, 2)}}</pre>
                                                            </v-expansion-panel-text>
                                                        </v-expansion-panel>
                                                    </v-expansion-panels>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card-text>
                                </v-card>
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
        return {
            components: [],
            incidents: []
        }
    },
    mounted() {
        this.sync()
        setInterval(this.sync, 1000)
    },
    methods: {
        sync: function(e) {
            let self = this
            axios.get(`https://${window.location.host}/api/components`)
            .then(function(response){
                self.components = response.data
            })
            axios.get(`https://${window.location.host}/api/incidents`)
            .then(function(response){
                self.incidents = response.data
            })
        }
    }
}
</script>
