# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Fresh 2.x web application built with Deno, using Preact for the UI layer, Vite for bundling, and Tailwind CSS 4.x + DaisyUI for styling.

## Development Commands

```bash
# Start development server with hot reload
deno task dev

# Build for production (outputs to _fresh/ directory)
deno task build

# Run production server (requires build first)
deno task start

# Format, lint, and type-check
deno task check

# Update Fresh framework
deno task update
```

## Architecture

### Route-Based Structure

Fresh uses file-system based routing combined with programmatic routes:

- **File-based routes**: Files in `routes/` automatically become HTTP endpoints
  - `routes/index.tsx` → `/`
  - `routes/about/index.tsx` → `/about`
  - `routes/api/[name].tsx` → `/api/:name` (dynamic parameter)

- **Programmatic routes**: Additional routes defined in `main.ts` via the `app` instance (e.g., `/api2/:name`)

### Islands Architecture

Fresh uses an islands architecture for interactivity:

- **Islands** (`islands/` directory): Interactive client-side components with hydration. These are the only components that ship JavaScript to the browser.
- **Components** (`components/` directory): Server-only components that render to HTML without client-side JavaScript.
- **Routes** (`routes/` directory): Define both pages and API endpoints. Use `define.page()` for pages.

### State Management

- **Type-safe state**: Global state shape is defined in `utils.ts` via the `State` interface
- **createDefine pattern**: `utils.ts` exports a typed `define` helper that provides type-safe `define.page()`, `define.middleware()`, etc.
- **Context state**: Shared state flows through `ctx.state` (set in middleware, accessed in routes/pages)
- **Signals**: Use `@preact/signals` for reactive state (see `Counter` island for example)

### Deno KV Database

This project uses Deno KV for data persistence:

- **Connection**: `kv.ts` provides `getKv()` singleton for accessing the KV instance
- **Helpers**: `kvHelpers.ts` contains CRUD utilities:
  - `createRecord<T>(prefix, data)` - Create with auto-generated UUID
  - `getRecord<T>(prefix, id)` - Retrieve by ID
  - `updateRecord<T>(prefix, id, data)` - Update existing record
  - `deleteRecord(prefix, id)` - Delete record
  - `listRecords<T>(prefix, options?)` - List all records with prefix
  - `incrementCounter(key, amount)` - Atomic counter operations

- **Key patterns**: Use arrays for hierarchical keys: `["notes", id]`, `["users", userId]`, `["cache", key]`
- **Example**: See `routes/api/notes/` for full CRUD API implementation
- **Data location**:
  - Development: Local KV database stored in Deno's cache directory
  - Production: Configure with `DENO_KV_ACCESS_TOKEN` for Deno Deploy or use local file path

### Middleware & App Setup

`main.ts` is the central application file:
- Creates the `App` instance
- Registers middleware (static files, logging, custom state)
- Defines programmatic routes
- Must call `app.fsRoutes()` to include file-system based routes

### Layout System

`routes/_app.tsx` defines the HTML shell wrapping all pages. It receives `Component` as a prop and renders it inside the HTML structure.

### Styling

- Tailwind CSS 4.x via `@tailwindcss/vite` plugin
- DaisyUI component library for pre-built UI components
- CSS imported in `client.ts` for HMR support
- Theme set via `data-theme` attribute on `<html>` element

### Build Output

Production builds output to `_fresh/` directory (excluded from version control). The built server is a single JS file that can be deployed with `deno serve`.
