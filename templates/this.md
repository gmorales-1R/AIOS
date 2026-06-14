# templates/

Sprout-level node type templates. Each child defines a reusable structure that the architect agent instantiates when scaffolding new nodes.

## What a template is

A template is a prescriptive pattern — it defines the expected directory structure, required files, stub content, and key `this.md` sections for a class of node. Templates are guides, not rigid schemas: a node may omit layers it does not need, but must document why.

## What lives here

| Template | Purpose |
|----------|---------|
| `app/` | Self-contained module with data, logic, and interfaces |
