from datetime import date, datetime, timedelta
from dateutil.rrule import rrule, DAILY

import copy
import random

PRELUDE = """---
apis: ["""

END = """]
---
"""

APIS = ["API 1", "API 2", "API 3"]

DAY_STATUS = ["fine", "limited", "broken", "maintenance"]
DAY_STATUS_WEIGHTS = [24, 4, 1, 2]

STATUS_TEXTS = {
    "fine": "operational",
    "limited": "limited",
    "broken": "broken",
    "maintenance": "maintenance"
}

class DayData:
    
    def __init__(self, date):
        self.date = date
        self.status = "fine"
        self.status_text = "operational"
        self.incidents = []

class Incident:

    def __init__(self, id, title, updates, resolved=False):
        self.id = id
        self.title = title
        self.updates = updates
        self.resolved = resolved
        self.date = None
        self.api = None

    def add_update(self, update):
        self.updates.append(update)
        if update.resolves:
            self.resolved = True
    
    def add_date(self, date, additional_hours=0):
        self.date = date
        current_time = date + timedelta(hours=6 + additional_hours, minutes=16, seconds=44)
        delta = timedelta(hours=2, minutes=13, seconds=23)
        for update in self.updates:
            update.datetime = current_time
            current_time = current_time + delta

class IncidentUpdate:

    def __init__(self, title, text, resolves=False):
        self.title = title
        self.text = text
        self.resolves = resolves
        self.datetime = None

INCIDENTS = {
    "maintenance": Incident(
        0,
        "Scheduled Maintenance",
        [
            IncidentUpdate(
                "Done",
                "Finished maintenance session. Service is back up.",
                resolves=True
            ),
            IncidentUpdate(
                "Started",
                "Started the scheduled maintenance session. Return to operational state is expected in roughly two hours.",
            ),
        ]
    ),
    "limited": Incident(
        1,
        "Sporadic erroneous rate limiting",
        [
            IncidentUpdate(
                "Resolved", 
                "We have corrected the faulty rate limiting configuration.",
                resolves=True
            ),
            IncidentUpdate(
                "Investigating",
                "Our internal monitoring has confirmed these reports."
            ),
            IncidentUpdate(
                "Notified",
                "We were notified that API 2 is sometimes unreachable due to rate limiting, even though the client is below their allotted quota."
            )
        ]
    ),
    "broken": Incident(
        2,
        "Service unreachable",
        [
            IncidentUpdate(
                "Identified", 
                "We have identified the root cause of the problem and are working on a workaround. A final fix will be scheduled for the next maintenance period.",
                resolves=True
            ),
            IncidentUpdate(
                "Investigating",
                "We have determined that the service itself is unreachable. The server running it seems fine."
            ),
            IncidentUpdate(
                "Notified",
                "We have received an automated warning about the service."
            )
        ]
    )
}

RESOLVING_UPDATES_MAINTENANCE = [
    IncidentUpdate(
        "Started",
        "Started the scheduled maintenance session. Return to operational state is expected in roughly two hours."
    )
]

def w(file, text):
    file.write(text + "\n")

def get_incident(api, day, additional_hours=0):
    incident = copy.deepcopy(INCIDENTS[day.status])
    incident.api = api
    incident.add_date(day.date, additional_hours)
    return incident

if __name__ == "__main__":
    end = date.today()
    start = end - timedelta(days=90)
    print(f"Generating data for period {start} to {end}")
    with open("generated.yaml", "w") as f:
        w(f, PRELUDE)
        for api in APIS:
            w(f, "  {")
            w(f, f"    name: {api},")
            days_limited = 0
            days_broken = 0
            days_maintenance = 0
            day_data = []
            for dt in rrule(DAILY, dtstart=start, until=end):
                day = DayData(dt)
                day.status = random.choices(DAY_STATUS, DAY_STATUS_WEIGHTS)[0]
                day.status_text = STATUS_TEXTS[day.status]
                if day.status == "limited":
                    days_limited = days_limited + 1
                if day.status == "broken":
                    days_broken = days_broken + 1
                if day.status == "maintenance":
                    days_maintenance = days_maintenance + 1
                if day.status != "fine":
                    day.incidents.append(get_incident(api, day))
                    if random.randrange(10) > 8:
                        day.incidents.append(get_incident(api, day, 7))
                day_data.append(day)
            days_total = len(day_data)
            days_fine = days_total - days_limited - days_broken - days_maintenance
            uptime = (days_total - (days_limited + days_broken + days_maintenance)) / days_total
            status = day_data[-1].status
            status_text = STATUS_TEXTS[status]
            w(f, f"    status: {status},")
            w(f, f"    status-text: {status_text},")
            w(f, f"    uptime: {uptime + 0.5:.2f},")
            w(f, f"    days: [")
            for day in day_data:
                w(f, "      {")
                w(f, f"        date: {day.date:%d.%m.%Y},")
                w(f, f"        status: {day.status},")
                w(f, f"        status-text: {day.status_text},")
                w(f,  "        incidents: [")
                for incident in day.incidents:
                    w(f,  "          {")
                    w(f, f"            id: {incident.id},")
                    w(f, f"            title: {incident.title},")
                    w(f, f"            api: {api},")
                    w(f, f"            updates: [")
                    for update in incident.updates:
                        w(f,  "              {")
                        w(f, f"                title: {update.title},")
                        w(f, f"                text: {update.text},")
                        w(f, f"                datetime: {update.datetime:%d.%m.%Y %H:%M:%S %Z},")
                        w(f, f"                resolves: {update.resolves}")
                        w(f,  "              },")    
                    w(f, f"            ],")
                    w(f,  "          },")
                w(f,  "        ]")
                w(f,  "      },")
            w(f, "    ]")
            w(f, "  },")
        
        w(f, END)
