# tinkerbell/db

Storage layer — CSV, replaceable. Two tables (`tinkerbell.csv` for thoughts, `steps.csv` for their reasoning steps) plus an append-only `log.csv`. See `schema.md` for fields. Only `code/` touches this directory directly.
