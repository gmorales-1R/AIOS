# tinkerbell/db — schema

## tinkerbell.csv (Thought)

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Unique, auto-incrementing. Source of truth is `counter.txt`. |
| created_at | ISO 8601 datetime | |
| updated_at | ISO 8601 datetime | |
| type | enum | `capture` · `reasoning` — starts as declared, `capture` auto-upgrades to `reasoning` the moment a step is added |
| title | string | |
| content | string | For `capture`: the raw thought. For `reasoning`: the question/problem statement. |
| tags | string | `;`-separated (not `,` — avoids CSV-quoting churn) |
| status | enum | `open` · `in_progress` · `resolved` · `archived` |
| conclusion | string | Empty until `status` is `resolved` |

## steps.csv (Step)

Child rows of a `reasoning` thought — one per deliberation step, in order.

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Unique, auto-incrementing. Source of truth is `steps_counter.txt`. |
| thought_id | integer | References `tinkerbell.csv.id` |
| seq | integer | 1-based order within the parent thought |
| created_at | ISO 8601 datetime | |
| content | string | One reasoning step |

## log.csv

| Field | Type | Notes |
|-------|------|-------|
| timestamp | ISO 8601 datetime | |
| table | enum | `thought` · `step` |
| operation | enum | `create` · `update` · `delete` |
| record_id | integer | References the id in the named table |
| changed_by | string | Agent name or `owner` |
| detail | string | Human-readable summary of the change |

## counter.txt / steps_counter.txt

Single integer on one line each. `counter.txt` holds the last assigned `Thought.id`, `steps_counter.txt` the last assigned `Step.id` — two counters because they're separate tables with independent id spaces. The code layer must read, increment, persist, then write the new row — never derive the next id from a CSV itself.
