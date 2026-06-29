# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal Hebrew-language task manager (to-do list) web app. The UI is right-to-left (RTL) and the interface text is in Hebrew. There is no build system, no package manager, and no framework — just three static files served directly in the browser.

## Running the App

Open `index.html` directly in a browser. No build step, server, or dependencies are required.

There are no automated tests, no linter configuration, and no CI pipeline. Verification is done by opening the app in a browser and exercising the UI manually.

## Architecture

The app is split across three files with tight coupling between them:

- **`index.html`** — DOM structure. Key element IDs: `task-form`, `task-input`, `task-list`, `empty-state`.
- **`script.js`** — All application logic. In-memory `tasks` array is the sole state store. `render()` fully rebuilds `#task-list` on every state change. Tasks are plain objects `{ id: string, text: string, done: boolean }` with IDs from `crypto.randomUUID()`. **No persistence** — state is lost on page refresh.
- **`styles.css`** — Styling using CSS custom properties defined at `:root`. Responsive up to 680px max-width.

Data flow: form submit → push to `tasks` array → `render()` → DOM rebuilt. Toggle/delete buttons call `render()` again after mutating the array.

## Conventions

- **HTML IDs / CSS classes:** kebab-case (`task-item`, `empty-state`, `task-form`)
- **JS variables:** camelCase (`tasks`, `emptyState`, `taskInput`)
- The `render()` function is the single source of truth for the DOM — do not manually mutate list items outside it.
- `aria-live="polite"` is set on `#task-list`; preserve it for accessibility.
