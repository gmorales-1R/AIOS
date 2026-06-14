# ToDo/db — schema

## todos.csv

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Unique, auto-incrementing. Source of truth is `counter.txt`. |
| title | string | |
| description | string | Optional |
| status | enum | `open` · `in_progress` · `done` · `cancelled` |
| priority | enum | `low` · `medium` · `high` |
| due_date | ISO 8601 date | Optional |
| created_at | ISO 8601 datetime | |
| tags | string | Comma-separated list |
| recurrence | string | RRULE string or empty |

## log.csv

| Field | Type | Notes |
|-------|------|-------|
| timestamp | ISO 8601 datetime | |
| operation | enum | `create` · `update` · `delete` |
| record_id | integer | References `todos.csv.id` |
| changed_by | string | Agent name or `owner` |
| detail | string | Human-readable summary of the change |

## counter.txt

Single integer on one line. Holds the last assigned `id`. The code layer must read, increment, persist, then write the new row — never derive the next ID from the CSV itself.
