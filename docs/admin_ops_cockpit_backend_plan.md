# Admin Ops Cockpit — Backend Implementation Plan

This screen is the single source of truth for the business. Everything here must come from real-time backend services.

## 1. Data Sources for Each Tile

### 1. Total Revenue (Today)
- **Data source**: Orders table `SUM(order.total_paise WHERE status='delivered' AND date=today)`
- **Backend API**: `GET /admin/metrics/revenue?interval=today`
- **Notes**: Include prepaid + COD collected. Exclude cancelled/refunded. Expose % change vs previous day.

### 2. Active Orders
- **Definition**: Orders not yet delivered or cancelled.
- **Filters**: created today OR older but still pending. Statuses: `placed`, `verified`, `packed`, `shipped`, `out-for-delivery`.
- **API**: `GET /admin/metrics/active-orders`
- **Calculate**: `COUNT(orders WHERE status IN (...))`

### 3. Pending Rx
- **Definition**: Prescriptions that need pharmacist attention.
- **Filters**: `status: pending_review`, OCR succeeded or waiting, linked or unlinked.
- **API**: `GET /admin/metrics/pending-rx`

### 4. Delivery Issues
- **Definition**: Orders with courier-related problems.
- **Triggers**: Courier API response failed, Delay > SLA, No pickup within X hours, NDR.
- **API**: `GET /admin/metrics/delivery-issues`

## 2. Urgent Attention List
- **Alert Types**: Rx rejected by user, Payment failed, Courier pickup delayed, Inventory out-of-stock, OCR backlog, Rx pending > 1hr, High refunds, System health.
- **Collection**: Background worker aggregates issues every 30-60s.
- **Table**: `ops_alerts` (id, type, message, order_id, severity, created_at, resolved_at).
- **API**: `GET /admin/ops/alerts?limit=5`, `PATCH /admin/ops/alerts/:id/resolve`

## 3. System Health Section
- **A. API Latency**: From Nginx/Gateway logs. `GET /admin/system/health`.
- **B. Payment Gateway**: Ping Razorpay every 5 mins.
- **C. OCR Worker**: Check Redis queue length.
- **D. Courier API**: Success rate of last 100 tracking updates.

## 4. Inventory Alerts
- **Alerts**: Low stock (< safety limit), Batches expiring soon (< 30 days), Out-of-stock active SKUs.
- **APIs**: `GET /admin/inventory/low-stock`, `GET /admin/inventory/expiring`.

## 5. Export Report Button
- **Flow**: Admin clicks Export -> Backend job queued -> Generate XLSX/CSV -> Upload S3 -> Email link.
- **API**: `POST /admin/reports/export`, `GET /admin/reports/status/:job_id`.

## 6. Refresh Button
- **Action**: Triggers soft cache invalidation.
- **API**: `POST /admin/dashboard/refresh`.

## 7. Data Update Frequency
- Revenue: 60s
- Active orders: 30s
- Pending Rx: 10-20s
- Delivery issues: 30s
- System health: 5s
- Inventory alerts: 120s
- Ops alerts: 15s

## 8. Backend Components
- Metrics Service, Alerts Service, Health Monitor Service, Inventory Watcher, Courier Watcher, Payment Watcher, Report Worker.

## 9. Events
- `ORDER_PLACED`, `PAYMENT_FAILED`, `RX_UPLOADED`, `RX_APPROVED`, `RX_REJECTED`, `INVENTORY_LOW`, `COURIER_DELAY`, `SYSTEM_LATENCY_SPIKE`, `OCR_QUEUE_BACKLOG`, `REFUND_INITIATED`, `DELIVERY_FAILURE`.

## 10. Security
- Roles: admin, ops, pharmacist, finance.
- Audit Logs: `admin_user_id`, `endpoint`, `payload`, `ip`, `timestamp`.

## 11. Backend Response Shapes
(See original prompt for JSON examples)

## 12. Backend Performance
- Caching: Revenue (60s TTL).
- Real-time: Polling or Redis Pub/Sub.
- Aggregates: Maintain separate table or Redis keys for metrics.

## 13. Backend Dependencies
- Redis, Postgres, Courier APIs, Razorpay Webhooks, OCR Worker, Event Emitter.
