# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIOS is a full AI system for developing, maintaining, and utilizing independent modules. The project is in its initial phase — no build tooling, source code, or test infrastructure exists yet.

## Current State

This repository contains only a `README.md`. Before meaningful development can begin, the following decisions need to be established and documented here:

- **Language/runtime**: What language(s) AIOS is built in (Python, TypeScript, Go, etc.)
- **Module structure**: How independent modules are organized, discovered, and composed
- **Build & test commands**: Once tooling is added, document them here
- **Entry points**: The main executable or library surface once code exists

## Updating This File

As the project evolves, update this file with:
- Build/lint/test commands (e.g. `make test`, `pytest`, `npm test`)
- How to run a single test in isolation
- Core architectural abstractions and how they relate to each other
- Any non-obvious conventions (naming, module boundaries, error handling patterns)
