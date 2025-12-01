# AI Admin Worker Implementation Plan

## 1. Summary
Add an **AI Admin Worker** (RAG + LLM + rules) that accepts natural-language prompts, suggests actions, and — with permissions & confirmations — executes admin tasks; exposed via a single “AI Assistant” button on the Ops Cockpit.

## 2. Core Principles
-   **Human-in-the-loop**: Mandatory for destructive/financial actions.
-   **Least Privilege**: RBAC enforcement.
-   **Immutable Audit**: Every prompt/action logged.
-   **Explainability**: Sources & confidence scores.
-   **Safety**: Rate limits, dry-run default, PII filtering.

## 3. Capabilities (MVP)
1.  **Read-only Queries**: Revenue, stock status, etc.
2.  **Suggestions**: Draft coupons, emails, reports.
3.  **Safe Writes**: "Approve Rx" (with confirmation).
4.  **Ops Execution**: Export reports, prefetch data.
5.  **Draft Actions**: Refunds, payouts (require approval).
6.  **Automation**: Rule edits (preview + apply).
7.  **Dev Ops**: Log analysis, health checks.

## 4. UI: Button & Modal
-   **Button**: "AI Assistant" in Ops Cockpit.
-   **Modal**: Chat, Actions, History tabs.
-   **Modes**: Suggest-only (default), Dry-run, Execute.
-   **Confirmations**: Popup with exact API payload, impact, and 2FA if needed.

## 5. Permissions & Approvals
-   Role checks per command.
-   Two-step approval for sensitive actions (Requester -> Approver).
-   2FA for Finance/Admin actions.

## 6. Data & Explainability
-   Response includes: Source list, Confidence score, Time-window.
-   RAG Citations: Link to source docs/logs.
-   Audit Table: `ai_actions` (id, user, prompt, payload, result, logs).

## 7. Integrations
-   **LLM**: Hosted/API + Local dev model.
-   **Vector DB**: Weaviate.
-   **Executor**: Maps payloads to internal APIs.
-   **Queue**: Redis/Bull.
-   **Monitoring**: Sentry.

## 8. API Endpoints
-   `POST /admin/ai/prompt` (Suggest + Dry-run)
-   `POST /admin/ai/execute` (Execute with token)
-   `GET /admin/ai/history`
-   `POST /admin/ai/approve/:action_id`
-   `GET /admin/ai/suggestions/:id`

## 9. Rollout Roadmap
-   **Phase 1**: Read-only + Suggestions (Chat + RAG).
-   **Phase 2**: Draft Actions + Dry-run (Payload generation).
-   **Phase 3**: Controlled Execution (RBAC + Confirmations).
-   **Phase 4**: Full Actionability (Autonomous low-risk ops).

## 10. Limitations
-   AI does **not** replace Pharmacist judgment.
-   Financial actions require human approval.
