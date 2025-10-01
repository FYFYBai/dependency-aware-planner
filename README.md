Dependency-Aware Planner

A full-stack Trello-like task management application with dependency awareness, critical path detection, and visualization.

Features:

Projects & Lists

Organize work into projects.

Create dynamic board lists (columns) like Todo, In Progress, Done.

Tasks

Create, update, move, and delete tasks.

Add deadlines and descriptions.

Dependencies

Link tasks with dependencies (task A must be completed before task B).

Prevent circular dependencies with cycle detection.

View the critical path (longest chain of blockers).

Visualization

Graph view: interactive dependency graph using Cytoscape.js.

Timeline / Gantt view: project scheduling with Frappe Gantt.

Simulation

Run “what-if” scenarios: mark tasks done and instantly see what unblocks.

Export

Export deadlines as .ics (calendar).

Generate .pdf project reports with jsPDF + AutoTable.

Tech Stack:

Backend:

Spring Boot 3 (REST APIs, DI, Security)

Spring Security with JWT

Spring Data JPA + Hibernate

PostgreSQL (via Docker + Compose)

JUnit 5 + Testcontainers (integration testing)

Frontend:

React (TypeScript) + Vite

Tailwind CSS for styling

dnd-kit for drag-and-drop board

Cytoscape.js (graph view)

Frappe Gantt (timeline view)

Axios + TanStack Query (data fetching/state)

Deployment

Docker + Docker Compose

Render/Fly.io (backend hosting)

Neon/Supabase (Postgres hosting)
