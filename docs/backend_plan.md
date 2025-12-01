# PulseKart Backend Implementation Plan

## 1. Objectives & Non-negotiables
- **Goal**: Secure, auditable, India-focused pharmacy dashboard backend.
- **Scope**: User accounts, orders, prescriptions, pharmacist workflow, payments (Razorpay UPI), instant-delivery flags, chatbot + RAG, admin roles, analytics.
- **Compliance**: Mobile-first performance, GDPR/Indian data rules compliance, encrypted PII, operational observability.

## 2. High-level Architecture
**Flow**: Frontend (Next.js) → API Gateway → Backend Services → DBs
- **DB**: PostgreSQL (Primary), Weaviate/Milvus (Vector), Redis (Cache/Queue).
- **Storage**: S3/MinIO (Files).
- **Auth**: NextAuth + Backend JWT.
- **OCR**: Tesseract/Google Vision.
- **Payment**: Razorpay.
- **Infra**: Kubernetes/Docker, GitHub Actions.

## 3. Service Breakdown
1.  **Auth Service**: Login, JWT, 2FA, Roles.
2.  **User Service**: Profile, Addresses, Wallet.
3.  **Product Service**: Catalog, Stock, Search Sync.
4.  **Cart/Checkout**: Pricing, Tax, Shipping, Coupons.
5.  **Order Service**: Lifecycle, Tracking, Webhooks.
6.  **Payment Service**: Razorpay integration, Refunds.
7.  **Prescription Service**: Upload, OCR, Verification, Audit.
8.  **Pharmacist Service**: Queue, Approval/Reject.
9.  **Doctor Service**: Directory, Search.
10. **RAG/Consult Service**: Weaviate Query, LLM, Triage.
11. **Notification Service**: Email, SMS, WhatsApp.
12. **Admin Service**: Management, Analytics.

## 4. Database Schema (Conceptual)
- `users`: id, email, phone, role, is_verified.
- `addresses`: id, user_id, pincode, lat, lng.
- `products`: id, slug, price, stock, instant_delivery_zones[].
- `orders`: id, user_id, status, total_paise, payment_status.
- `prescriptions`: id, user_id, file_url, ocr_text, status, pharmacist_id.
- `pharmacist_queue`: id, prescription_id, status, logs.
- `doctors`: id, name, specialty, verified.
- `medical_chunks`: chunk_id, vector_id, credibility.
- `audit_logs`: user_id, action, timestamp.

## 5. API Endpoints (v1)
### Auth
- `POST /auth/register`, `/auth/login`, `/auth/refresh`

### User
- `GET /users/me`, `POST /users/:id/addresses`

### Products
- `GET /products`, `POST /products/import`

### Cart & Checkout
- `POST /cart/items`, `POST /checkout/create`, `POST /checkout/complete`

### Orders
- `GET /orders`, `POST /orders/:id/track`

### Payments
- `POST /payments/razorpay/create-order`, `/webhook`

### Prescriptions
- `POST /prescriptions/upload`, `POST /pharmacist/:id/approve`

### Consult
- `POST /consult/session`, `/consult/message`

## 6. Business Logic
- **Price Snapshots**: Store at order time.
- **Rx Enforcement**: Block checkout for Rx items if not approved.
- **Stock Reservation**: Short TTL at checkout.
- **Instant Delivery**: Zonal inventory checks.

## 7. RAG & Chatbot
- **Pipeline**: Ingest -> Chunk -> Embed -> Weaviate.
- **Flow**: Query -> Vector Search -> Prompt -> LLM -> Response.
- **Safety**: Red-flag detection before generation.

## 8. File Uploads & OCR
- Multipart upload -> S3 -> Redis Queue -> OCR Worker -> DB.

## 9. Security
- TLS, Encrypted PII, RBAC, Webhook Signatures, Rate Limiting.

## 10. Observability
- Sentry, Prometheus, ELK/Loki, Audit Logs.

## 11. Roadmap (Sprints)
- **Sprint 0**: Infra (Docker, PG, Redis).
- **Sprint 1**: Core Accounts & Products.
- **Sprint 2**: Cart, Checkout, Razorpay.
- **Sprint 3**: Prescriptions & Pharmacist.
- **Sprint 4**: RAG & Consult.
- **Sprint 5**: Admin & Doctors.
- **Sprint 6**: Analytics & Polish.
