# PulseKart Admin Dashboard Implementation Plan

## 1. Goal
Provide a secure, auditable admin dashboard and API suite so operations teams can manage catalog, inventory, orders, prescriptions, pricing, coupons, delivery zones, partners, and finance workflows with automation and clear audit trails.

## 2. Roles & Permissions (RBAC)
- **Super Admin**: Full access.
- **Operations Manager**: Orders, deliveries, returns, reports.
- **Catalog Manager**: Products, categories, SEO, bulk import.
- **Inventory Manager**: Stock, warehouses, replenishment.
- **Pharmacist**: Rx approvals, audit, hold/release.
- **Finance**: Payments, refunds, reconciliation.
- **Support**: View orders, limited refunds, tickets.
- **Analytics**: Read-only KPIs.

## 3. Core Modules
1.  **Overview / Ops Cockpit**: Live KPIs, Alerts.
2.  **Orders**: List w/ filters, Detail panel, Actions (status, courier, refund).
3.  **Prescriptions / Pharmacist Queue**: Queue, OCR preview, Approve/Reject, Audit logs.
4.  **Products / Catalog**: CRUD, Bulk import/export, Draft/Publish.
5.  **Inventory & Warehouses**: Multi-warehouse view, Barcode scanning, Replenishment rules.
6.  **Coupons & Promotions**: Create coupon, Preview, Usage history.
7.  **Payments & Refunds**: Reconciliation, Transaction details, Payouts.
8.  **Delivery & Zones**: Zone definitions, SLA management, Courier status.
9.  **Doctor Directory**: Profiles, Verification, Referrals.
10. **Users & Support**: User profiles, Ticketing.
11. **Reports & Exports**: Sales, Refunds, Rx stats, CSV exports.
12. **Settings**: Integrations (Razorpay, Courier, OCR).
13. **Audit & Compliance**: Global audit log.

## 4. Key Workflows
-   **Order Processing**: Reserve stock -> Rx check -> Payment capture -> Pharmacist review -> Pack & Dispatch -> Track.
-   **Prescription Approval**: View OCR + Image -> Edit -> Confirm/Reject.
-   **Inventory Replenishment**: Safety stock triggers -> PO draft -> Batch receive.
-   **Coupon Lifecycle**: Create -> Monitor -> Expire -> Audit.
-   **Refund/Return**: Request -> Validate -> Finance Approve -> Razorpay API.

## 5. Admin APIs (Summary)
-   `GET /admin/orders`, `POST /admin/order/:id/status`
-   `GET /admin/prescriptions`, `POST /admin/prescription/:id/approve`
-   `GET /admin/products`, `POST /admin/product`
-   `GET /admin/inventory`, `POST /admin/inventory/adjust`
-   `GET /admin/coupons`, `POST /admin/coupon`
-   `GET /admin/reports/sales`
-   `GET /admin/audit-logs`

## 6. Data Model Additions
-   `purchase_orders`, `warehouse_stock`, `audit_events`, `coupon_redemptions`, `refunds`, `courier_awbs`.

## 7. Automation & Rules
-   **Inventory**: Low-stock triggers.
-   **Order**: Express routing.
-   **Rx**: Auto-suggest approval (high confidence).
-   **Fraud**: Flag large/suspicious orders.

## 8. Integrations
-   Razorpay, Courier APIs, OCR (Tesseract/Vision), Weaviate, Meilisearch, SMS/WhatsApp.

## 9. Audit & Compliance
-   Append-only `audit_event` log.
-   Strict ACL for Rx images.
-   Retention policies.

## 10. UI/UX Expectations
-   List-heavy tables, Bulk actions, Slide-in details.
-   Keyboard shortcuts, Export buttons.

## 11. Security
-   RBAC, IP allowlist (optional), 2FA (mandatory for sensitive roles), Rate-limiting.

## 12. Reporting
-   Orders/hour, Revenue, Rx stats, Courier success, Stock-outs.

## 13. Notifications
-   Real-time alerts (Slack/Teams) for failures.
-   In-dashboard alerts for urgent tasks.

## 14. Runbooks
-   Payment failure, Rx rejection, Courier failure, Price correction.

## 15. Rollout Phases
-   **Phase 1 (MVP)**: Orders, Products, Inventory, Basic Rx.
-   **Phase 2**: Full Rx, Warehouses, Coupons, Returns.
-   **Phase 3**: Automation, Couriers, Reports.
-   **Phase 4**: Analytics, ERP integration.
