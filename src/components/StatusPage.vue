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
                <v-expansion-panels>
                    <v-expansion-panel v-for="component in components" :key="component.slug">
                        <v-expansion-panel-title :class="component.conditions !== undefined ? ['bg-red'] : ['bg-green']">
                            {{component.slug}}
                            <v-chip v-for="(value, key) in component.labels" :key="key">
                                {{key}}={{value}}
                            </v-chip>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            Current condition:
                            <template v-if="component.conditions === undefined">
                                OK
                            </template>
                            <template v-else v-for="condition in component.conditions" :key="condition">
                                {{condition}}
                            </template>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    data: () => ({
        components: [
            {
                "slug": "hypervisor-00001",
                "labels": {
                    "az": "1",
                    "region": "datacenter-west"
                }
            },
            {
                "slug": "hypervisor-00002",
                "labels": {
                    "az": "2",
                    "region": "datacenter-west"
                },
                "conditions": [
                    "connectivity_problems"
                ]
            },
            {
                "slug": "hypervisor-00003",
                "labels": {
                    "az": "1",
                    "region": "datacenter-east"
                }
            },
            {
                "slug": "hypervisor-00004",
                "labels": {
                    "az": "2",
                    "region": "datacenter-east"
                }
            }
        ]
    })
}
</script>
