# Admin Dashboard Strategy & Vision

## Executive Summary
Make the admin faster, more focused on ops, mobile-first, RAG-enabled, and automated — with measurably better UX, lower time-to-decision, and tighter auditability than incumbents.

## Core Differentiators
1.  **Mobile-first Operational UX**: Single-tap approvals, barcode scanning.
2.  **Instant Rules Engine**: JSON-based logic for routing and inventory (live in <1 min).
3.  **Prescription-first Flow**: OCR + Pharmacist HIL + Audit Trail.
4.  **Hybrid Search**: Faceted (Meili) + Semantic (Weaviate).
5.  **Express Fulfillment**: Separate pipeline, SLA enforcement.
6.  **Real-time Ops Cockpit**: Alerts + Root-cause hints.
7.  **Low-code Connector Builder**: Webhooks + transformation for vendors.
8.  **Audit-first Design**: Immutable logs for legal compliance.

## Prioritized Roadmap

### Phase A (0–90 days) — Win Quick
-   Mobile scan & pharmacist micro-approval feature.
-   Rules engine MVP (JSON editor + live toggle).
-   Rx OCR worker + HIL queue.
-   Ops Cockpit real-time refresh + alerts.
-   Semantic search POC.

### Phase B (90–180 days) — Scale & Polish
-   Full express pipeline + courier adapter.
-   Warehouse batch + expiry UI + recall workflow.
-   Low-code connector UI.
-   Mobile admin app offline sync.

### Phase C (180–365 days) — Domination
-   RAG-driven recommendations.
-   Anomaly detection & auto-remediation.
-   Full payroll/employee ops integration.
-   Multi-warehouse SLO automation.

## UX Micro-interactions
-   One-click "approve & capture".
-   Inline quantity adjustments.
-   Soft confirmations (undo toast).
-   Keyboard shortcuts (G, P, R).

## Architecture Priorities
-   **Event-driven**: `ORDER_CREATED`, `RX_UPLOADED`, etc.
-   **Vector + Facet Search**: Weaviate + Meilisearch.
-   **Redis Caching**: Real-time metrics.
-   **API-first**: OpenAPI for all actions.

## Immediate Checklist
1.  **Pharmacist Priority**: One-tap approve + capture toggle.
2.  **Rules Engine**: Small JSON editor in admin linked to worker.
3.  **OCR Worker**: Launch queue + measure approval time.
4.  **Dashboard Metrics**: Hook Redis cache.
5.  **Courier Adapter**: Skeleton interface + 1 partner.
