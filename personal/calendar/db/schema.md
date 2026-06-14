# calendar/db — schema

## calendar.csv

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Unique, auto-incrementing. Source of truth is `counter.txt`. |
| title | string | |
| start | ISO 8601 datetime | |
| end | ISO 8601 datetime | |
| location | string | Optional |
| description | string | Optional |
| recurrence | string | RRULE string or empty |
| status | enum | `proposed` · `confirmed` · `cancelled` · `done` |

## log.csv

| Field | Type | Notes |
|-------|------|-------|
| timestamp | ISO 8601 datetime | |
| operation | enum | `create` · `update` · `delete` |
| record_id | integer | References `calendar.csv.id` |
| changed_by | string | Agent name or `owner` |
| detail | string | Human-readable summary of the change |

## counter.txt

Single integer on one line. Holds the last assigned `id`. The code layer must read, increment, persist, then write the new row — never derive the next ID from the CSV itself.
